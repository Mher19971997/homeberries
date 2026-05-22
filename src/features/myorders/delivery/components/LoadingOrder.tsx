import { Card, Grid, Skeleton } from '@mui/material';
import styles from "@homeberris/features/myorders/delivery/styles/index.module.css";

export const LoadingOrder = () => {
    return (
        <Grid container spacing={2}>
            {[1, 2, 3].map((i) => (
                <Grid item xs={12} key={i}>
                    <Card className={styles.orderCard}>
                        <Skeleton variant="rectangular" height={200} />
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};
