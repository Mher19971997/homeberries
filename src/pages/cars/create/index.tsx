import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import { useCookies } from 'react-cookie';
import { Box, Breadcrumbs, Typography, Alert, Grid, Link as MuiLink } from '@mui/material';
import Link from 'next/link';

import { createCar } from '@homeberris/http/carApi';
import { checkToken } from '@homeberris/utils/auth';
import { CarAppearance, CarEngineTransmission, CarImages, CarPriceYear, CreateCarActions, useCreateCarForm } from '@homeberris/features/cars';


export default function CreateCarPage() {
  const router = useRouter();
  const [cookies] = useCookies(['token']);
  const isAuth = checkToken();

  const {
    formData,
    mainImage,
    galleryImages,
    imagePreviews,
    handleChange,
    handleMainImageChange,
    handleGalleryImagesChange,
    removeGalleryImage,
  } = useCreateCarForm();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { mutate, isLoading } = useMutation((data: FormData) => createCar(data), {
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => router.push('/cars'), 2000);
    },
    onError: (err: any) =>
      setError(err?.response?.data?.message || 'Ошибка при создании автомобиля'),
  });

  useEffect(() => {
    if (!isAuth) router.push('/security/login');
  }, [isAuth, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== null) form.append(key, String(value));
    });

    if (mainImage) form.append('main_image', mainImage);
    galleryImages.forEach(img => form.append('gallery_images', img));

    mutate(form);
  };

  if (!isAuth) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <MuiLink component={Link} color="inherit" href="/">Главная</MuiLink>
        <MuiLink component={Link} color="inherit" href="/cars">Автомобили</MuiLink>
        <Typography color="text.primary">Добавить автомобиль</Typography>
      </Breadcrumbs>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Автомобиль успешно создан! Перенаправление...
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <CarPriceYear formData={formData} handleChange={handleChange} />
          <CarAppearance formData={formData} handleChange={handleChange} />
          <CarEngineTransmission formData={formData} handleChange={handleChange} />
          <CarImages
            mainImage={mainImage}
            handleMainImageChange={handleMainImageChange}
            galleryImages={galleryImages}
            handleGalleryImagesChange={handleGalleryImagesChange}
            removeGalleryImage={removeGalleryImage}
            imagePreviews={imagePreviews}
          />
          <CreateCarActions isLoading={isLoading} />
        </Grid>
      </form>
    </Box>
  );
}
