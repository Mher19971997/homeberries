import React from 'react';
import { Box, Grid, Paper, Button, IconButton } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { IImagePreviews } from '@homeberris/features/cars/types';
import { useTranslation } from 'next-i18next';

interface Props {
    mainImage: File | null;
    handleMainImageChange: (file: File | null) => void;
    galleryImages: File[];
    handleGalleryImagesChange: (files: File[]) => void;
    removeGalleryImage: (index: number) => void;
    imagePreviews: IImagePreviews;
}

export const CarImages: React.FC<Props> = ({
    mainImage,
    handleMainImageChange,
    galleryImages,
    handleGalleryImagesChange,
    removeGalleryImage,
    imagePreviews
}) => {
    const { t } = useTranslation('common');

    const onMainImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        handleMainImageChange(file);
    };

    const onGalleryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        handleGalleryImagesChange(files);
    };

    return (
        <>
            {/* Main Image */}
            <Grid item xs={12} md={6}>
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="main-image-upload"
                    type="file"
                    onChange={onMainImageInputChange}
                />
                <label htmlFor="main-image-upload">
                    <Paper
                        sx={{
                            width: '100%',
                            height: 200,
                            background: mainImage ? `url(${imagePreviews.main}) center/cover no-repeat` : '#eee',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        {!mainImage && <PhotoCameraIcon sx={{ fontSize: 48 }} />}
                    </Paper>
                </label>
                {mainImage && (
                    <Button
                        onClick={() => handleMainImageChange(null)}
                        startIcon={<DeleteIcon />}
                        sx={{ mt: 1 }}
                        fullWidth
                    >
                        {t('cars.create.images.delete')}
                    </Button>
                )}
            </Grid>

            {/* Gallery Images */}
            <Grid item xs={12} md={6}>
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="gallery-images-upload"
                    type="file"
                    multiple
                    onChange={onGalleryInputChange}
                />
                <label htmlFor="gallery-images-upload">
                    <Button component="span" startIcon={<AddIcon />} fullWidth>
                        {t('cars.create.images.addImages')}
                    </Button>
                </label>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {imagePreviews.gallery.map((src, i) => (
                        <Grid item xs={6} sm={4} key={i}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    width: '100%',
                                    pt: '75%',
                                    backgroundImage: `url(${src})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: 1,
                                }}
                            >
                                <IconButton
                                    onClick={() => removeGalleryImage(i)}
                                    sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.7)' }}
                                    size="small"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </>
    );
};
