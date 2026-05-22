import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Modal,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import dynamic from "next/dynamic";
import styles from "./index.module.css";

// -------------- Динамический импорт Cropper --------------
const Cropper = dynamic(
  () => import("react-cropper").then((mod) => mod.Cropper),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    ),
  },
);

type CropperClass = any; // тип, полученный из динамического импорта

interface PhotoSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PhotoSearchModal({ open, onClose }: PhotoSearchModalProps) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [croppedImage, setCroppedImage] = useState<File | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [cropperReady, setCropperReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<CropperClass | null>(null);

  // Client‑only flag
  useEffect(() => setIsClient(true), []);

  // ---------- Открываем файловый диалог ----------
  const openFileDialog = () => fileInputRef.current?.click();

  // ---------- Чтение выбранного файла ----------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ---------- Cropper готов ----------
  const handleReady = () => setCropperReady(true);

  // ---------- Обрезаем ----------
  const handleCrop = () => {
    if (!cropperReady) return;
    if (!cropperRef.current) return;
    const cropperJs = cropperRef.current.cropper; // <-- объект cropperjs
    if (!cropperJs) return;

    cropperJs.getCroppedCanvas().toBlob((blob: Blob | null) => {
      if (!blob) return;
      const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
      setCroppedImage(file);
    }, "image/jpeg", 0.9);
  };

  // ---------- Поиск ----------
  const handleSearch = async () => {
    if (!croppedImage) return;
    // Здесь вызываем ваш API (см. пример в предыдущем ответе)
    console.log("Отправляем файл:", croppedImage);
    // После отправки можно закрыть модал:
    handleClose();
  };

  // ---------- Закрытие ----------
  const handleClose = () => {
    setImageSrc("");
    setCroppedImage(null);
    setCropperReady(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box className={styles.modalContainer}>
        {/* Header */}
        <Box className={styles.modalHeader}>
          <Typography variant="h6" className={styles.modalTitle}>
            Поиск по фото
          </Typography>
          <IconButton onClick={handleClose} className={styles.closeButton}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Body */}
        <Box className={styles.modalContent}>
          {/* –– Нет выбранного изображения –– */}
          {!imageSrc && (
            <Box className={styles.uploadArea}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <CloudUploadIcon className={styles.uploadIcon} />
              <Typography className={styles.uploadText}>
                Загрузите изображение для поиска
              </Typography>
              <Button
                variant="contained"
                onClick={openFileDialog}
                className={styles.uploadButton}
              >
                Выбрать файл
              </Button>
            </Box>
          )}

          {/* –– Выбрано изображение –– */}
          {imageSrc && (
            <Box className={styles.cropperContainer}>
              {isClient && (
                <Cropper
                  ref={cropperRef}
                  src={imageSrc}
                  style={{ height: 400, width: "100%" }}
                  aspectRatio={1}
                  guides={true}
                  viewMode={1}
                  responsive={true}
                  background={false}
                  autoCropArea={1}
                  checkOrientation={false}
                  ready={handleReady}
                  crop={handleCrop}
                />
              )}

              {/* Кнопки под cropper */}
              <Box className={styles.cropperActions}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setImageSrc("");
                    setCroppedImage(null);
                    setCropperReady(false);
                  }}
                >
                  Выбрать другое
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={!croppedImage}
                  className={styles.searchButton}
                >
                  Найти
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
};
