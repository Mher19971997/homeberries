import { Card, CardContent, Typography } from "@mui/material";
import { CompanyAddress as AddressType } from "@homeberris/features/company/types";

export const CompanyAddress = ({ address }: { address: AddressType }) => (
    <Card sx={{ mb: 2 }}>
        <CardContent>
            <Typography variant="h6">{address.address}</Typography>
            <Typography variant="body2" color="text.secondary">
                Координаты: {address.latitude}, {address.longitude}
            </Typography>
        </CardContent>
    </Card>
);
