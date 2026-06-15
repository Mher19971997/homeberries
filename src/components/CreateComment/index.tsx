import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Rating,
  Typography,
  IconButton,
  Paper,
  CircularProgress
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { useCookies } from 'react-cookie';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createComment } from '@homeberris/http/commentApi';
import { UUID } from 'crypto';
import { checkToken } from '@homeberris/utils/auth';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useToast } from '@homeberris/hooks/useToast';
import Toast from '@homeberris/components/Toast';
import styles from './index.module.css';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

interface CreateCommentProps {
  catalogUuid: UUID;
  onSuccess?: () => void;
}

const CreateComment: React.FC<CreateCommentProps> = ({ catalogUuid, onSuccess }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [cookies] = useCookies(['token']);
  const queryClient = useQueryClient();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [text, setText] = useState('');
  const [rating, setRating] = useState<number | null>(5);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthenticated = checkToken();

  const mutation = useMutation({
    mutationFn: (data: { text: string; catalogUuid: UUID; image?: File }) =>
      createComment(data, cookies.token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getCatalogByUud', catalogUuid] });
      setText('');
      setRating(5);
      setSelectedImage(null);
      setImagePreview(null);
      setIsExpanded(false);
      setIsSubmitting(false);
      showSuccess(t('createComment.successMessage'));
      onSuccess?.();
    },
    onError: (error: any) => {
      showError(error?.response?.data?.message || t('createComment.errorMessage'));
      setIsSubmitting(false);
    },
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !isAuthenticated) return;

    setIsSubmitting(true);
    mutation.mutate({
      text: text.trim(),
      catalogUuid,
      image: selectedImage || undefined
    });
  };

  const handleExpand = () => {
    if (!isAuthenticated) {
      router.push('/security/login');
      return;
    }
    setIsExpanded(true);
  };

  if (!isExpanded) {
    return (
      <Box className={styles.container}>
        <Button
          variant="outlined"
          className={styles.writeButton}
          onClick={handleExpand}
        >
          <Typography className={styles.writeButtonText}>
            {t('createComment.writeReview')}
          </Typography>
        </Button>
      </Box>
    );
  }

  return (
    <Paper className={styles.formContainer} elevation={2}>
      <Box className={styles.formHeader}>
        <Typography variant="h6" className={styles.formTitle}>
          {t('createComment.writeReview')}
        </Typography>
        <IconButton
          size="small"
          onClick={() => {
            setIsExpanded(false);
            setText('');
            setSelectedImage(null);
            setImagePreview(null);
          }}
          className={styles.closeButton}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Box className={styles.ratingContainer}>
          <Typography variant="body2" className={styles.ratingLabel}>
            {t('createComment.rateProduct')}
          </Typography>
          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            size="large"
            className={styles.rating}
          />
        </Box>

        <TextField
          multiline
          rows={6}
          placeholder={t('createComment.placeholder')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={styles.textField}
          fullWidth
          variant="outlined"
          required
        />

        {imagePreview && (
          <Box className={styles.imagePreviewContainer}>
            <Box className={styles.imagePreview}>
              <Image src={imagePreview} alt="Preview" className={styles.previewImage} width={200} height={200} />
              <IconButton
                size="small"
                onClick={handleRemoveImage}
                className={styles.removeImageButton}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}

        <Box className={styles.actionsContainer}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="comment-image-upload"
            type="file"
            onChange={handleImageSelect}
          />
          <label htmlFor="comment-image-upload">
            <IconButton
              component="span"
              className={styles.imageButton}
              disabled={isSubmitting}
            >
              <PhotoCameraIcon />
              <Typography variant="body2" className={styles.imageButtonText}>
                {t('createComment.photo')}
              </Typography>
            </IconButton>
          </label>

          <Button
            type="submit"
            variant="contained"
            className={styles.submitButton}
            disabled={!text.trim() || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <SendIcon />}
          >
            {isSubmitting ? t('createComment.sending') : t('createComment.submit')}
          </Button>
        </Box>
      </form>
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </Paper>
  );
};

export default CreateComment;
