import { Paper, Typography, Box, Chip } from '@mui/material';
import styles from '@homeberris/features/cars/styles/carDetail.module.css';

interface Props {
    car: any;
}

export const CarEquipment = ({ car }: Props) => {
    if (!car?.equipment) return null;

    const equipment =
        typeof car.equipment === 'string'
            ? JSON.parse(car.equipment)
            : car.equipment;

    if (!equipment?.length) return null;

    return (
        <Paper className={styles.equipment}>
            <Typography variant="h6" className={styles.sectionTitle}>
                Комплектация
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
