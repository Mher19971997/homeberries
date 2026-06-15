import Link from 'next/link';
import { Breadcrumbs, Typography, Link as MuiLink } from '@mui/material';
import { useTranslation } from 'next-i18next';

interface Props {
    brandId?: string;
    modelId?: string;
    subModelId?: string;
    currentBrand?: any;
    currentModel?: any;
}

export const CarsBreadcrumbs = ({
    brandId,
    modelId,
    subModelId,
    currentBrand,
    currentModel,
}: Props) => {
    const { t } = useTranslation('common');
    return (
        <Breadcrumbs sx={{ mb: 2 }}>
            <MuiLink component={Link} href="/" underline="hover">
                {t('nav.home')}
            </MuiLink>

            <MuiLink component={Link} href="/cars" underline="hover">
                {t('carsBreadcrumbs.cars')}
            </MuiLink>

            {currentBrand && (
                <MuiLink
                    component={Link}
                    href={`/cars?brand=${brandId}`}
                    underline="hover"
                >
                    {currentBrand.brand}
                </MuiLink>
            )}

            {currentModel && (
                <Typography color="text.primary">
                    {currentModel.model}
                </Typography>
            )}
        </Breadcrumbs>
    );
};
