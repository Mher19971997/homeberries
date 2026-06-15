import React from 'react';
import { useTranslation } from 'next-i18next';
import {
  FacebookShareButton,
  FacebookIcon,
  WhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon,
  TelegramShareButton,
  TelegramIcon
} from 'next-share';
import { Box, Typography } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import styles from '@homeberris/components/ShareButton/index.module.css';
import CustomModal from '../CustomModal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useToast } from '@homeberris/hooks/useToast';
import Toast from '../Toast';

interface ShareButtonProps {
  shareUrl: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ shareUrl }) => {
  const { t } = useTranslation('common');
  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const { toast, showSuccess, showError, hideToast } = useToast();

  const handleClose = (): void => setOpenModal(false);
  const handleCopyClick = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        showSuccess(t('shareButton.linkCopied'));
        handleClose();
      })
      .catch((error) => {
        showError(t('shareButton.copyError'));
      });
  };
  return (
    <React.Fragment>
      <Box className={styles.shareBtn} onClick={() => setOpenModal(true)}>
        <ShareIcon />
      </Box>
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      <Box>
        <Box className={styles.locatonBlock}></Box>
        <CustomModal
          width={'25%'}
          open={openModal}
          title={t('shareButton.title')}
          handleClose={handleClose}
        >
          <Box className={styles.content}>
            <Box className={styles.shareBtns}>
              <TelegramShareButton url={shareUrl}>
                <TelegramIcon size={48} round />
              </TelegramShareButton>
              <FacebookShareButton url={shareUrl}>
                <FacebookIcon size={48} round />
              </FacebookShareButton>
              <WhatsappShareButton url={shareUrl}>
                <WhatsappIcon size={48} round />
              </WhatsappShareButton>
              <LinkedinShareButton url={shareUrl}>
                <LinkedinIcon size={48} round />
              </LinkedinShareButton>
            </Box>
            <Box
              className={styles.copyTextBox}
              onClick={() => {
                // setOpenSuccess(true);
                handleCopyClick()
                
                
              }}
            >
              <Typography>{t('shareButton.copyLink')}</Typography>
              <ContentCopyIcon />
            </Box>
          </Box>
        </CustomModal>
      </Box>
    </React.Fragment>
  );
};

export default ShareButton;
