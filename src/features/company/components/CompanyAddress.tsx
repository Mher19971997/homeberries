import { Card, CardContent, Typography } from "@mui/material";
import { CompanyAddress as AddressType } from "@homeberris/features/company/types";
import { useTranslation } from 'next-i18next';

export const CompanyAddress = ({ address }: { address: AddressType }) => {
    const { t } = useTranslation('common');
    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="h6">{address.address}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {t('companyAddress.coordinates')}: {address.latitude}, {address.longitude}
                </Typography>
            </CardContent>
        </Card>
    );
};
