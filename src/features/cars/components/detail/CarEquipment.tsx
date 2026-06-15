import { Paper, Typography, Box, Chip } from '@mui/material';
import styles from '@homeberris/features/cars/styles/carDetail.module.css';
import { useTranslation } from 'next-i18next';

interface Props {
    car: any;
}

export const CarEquipment = ({ car }: Props) => {
    const { t } = useTranslation('common');
    if (!car?.equipment) return null;

    const equipment =
        typeof car.equipment === 'string'
            ? JSON.parse(car.equipment)
            : car.equipment;

    if (!equipment?.length) return null;

    return (
        <Paper className={styles.equipment}>
            <Typography variant="h6" className={styles.sectionTitle}>
                {t('cars.equipment.title')}
            </Typography>

            <Box className={styles.equipmentList}>
                {equipment.map((item: string, index: number) => (
                    <Chip
                        key={index}
                        label={item}
                        variant="outlined"
                        className={styles.equipmentChip}
                    />
                ))}
            </Box>
        </Paper>
    );
};
