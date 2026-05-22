import { useState } from 'react';
import { IFormData, IImagePreviews } from '../types';

export const useCreateCarForm = () => {
    const [formData, setFormData] = useState<IFormData>({
        brand_id: '',
        model_id: '',
        sub_model_id: '',
        title: '',
        description: '',
        price: '',
        year: '',
        mileage: '',
        color: '',
        engine_type: '',
        engine_volume: '',
        engine_power_hp: '',
        transmission: '',
        drive_type: '',
        fuel_consumption_city: '',
        fuel_consumption_highway: '',
        tire_size: '',
        wheel_size: '',
        is_new: false,
    });

    const [mainImage, setMainImage] = useState<File | null>(null);
    const [galleryImages, setGalleryImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<IImagePreviews>({
        main: null,
        gallery: [],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'brand_id' ? { model_id: '', sub_model_id: '' } : {}),
            ...(name === 'model_id' ? { sub_model_id: '' } : {}),
        }));
    };

    const handleMainImageChange = (file: File | null) => {
        setMainImage(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreviews(prev => ({ ...prev, main: reader.result as string }));
            reader.readAsDataURL(file);
        } else {
            setImagePreviews(prev => ({ ...prev, main: null }));
        }
    };

    const handleGalleryImagesChange = (files: File[]) => {
        setGalleryImages(files);
        const readers = files.map(file =>
            new Promise<string>(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            })
        );
        Promise.all(readers).then(previews => setImagePreviews(prev => ({ ...prev, gallery: previews })));
    };

    const removeGalleryImage = (index: number) => {
        setGalleryImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index),
        }));
    };

    return {
        formData,
        handleChange,
        mainImage,
        handleMainImageChange,
        galleryImages,
        handleGalleryImagesChange,
        removeGalleryImage,
        imagePreviews,
    };
};
