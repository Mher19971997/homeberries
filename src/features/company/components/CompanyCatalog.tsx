import { Card, CardContent, CardMedia, Typography, Button, Grid } from "@mui/material";
import Link from "next/link";
import { CompanyCatalog as CatalogType } from "@homeberris/features/company/types";

export const CompanyCatalog = ({ catalog }: { catalog: CatalogType }) => (
    <Grid item xs={12} sm={6} md={4}>
        <Card>
            {catalog.images && catalog.images.length > 0 && (
                <CardMedia
                    component="img"
                    height="200"
                    image={catalog.images[0].url}
                    alt={catalog.name}
                />
            )}
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {catalog.name}
                </Typography>
                {catalog.description && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        {catalog.description}
                    </Typography>
                )}
                <Typography variant="h6" color="primary" mb={2}>
                    {catalog.price} ₽
                </Typography>
                <Link href={`/catalog/${catalog.uuid}`} passHref>
                    <Button variant="contained" fullWidth>
                        Посмотреть товар
                    </Button>
                </Link>
            </CardContent>
        </Card>
    </Grid>
);
