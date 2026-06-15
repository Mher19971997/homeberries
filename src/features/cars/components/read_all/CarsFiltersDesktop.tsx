import {
  Grid,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { getBodyTypeLabel } from '@homeberris/features/cars/utils/bodyTypeLabel';
import { useTranslation } from 'next-i18next';

export const CarsFiltersDesktop = ({
  carMenu,
  brandId,
  modelId,
  subModelId,
  router,
}: any) => {
  const { t } = useTranslation('common');
  return (
    <Grid item md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
      <Paper
        sx={{
          p: 2,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600 }}
        >
          {t('cars.filters.brands')}
        </Typography>

        <List dense>

          {/* Все бренды */}
          <ListItemButton
            selected={!brandId}
            onClick={() => router.push('/cars')}
            sx={{ borderRadius: 2 }}
          >
            <ListItemText primary={t('cars.filters.allBrands')} />
          </ListItemButton>

          {carMenu?.map((brand: any) => (
            <div key={brand.uuid}>

              {/* BRAND */}
              <ListItemButton
                selected={brand.uuid === brandId}
                onClick={() =>
                  router.push({
                    pathname: '/cars',
                    query: { brand: brand.uuid },
                  })
                }
                sx={{ borderRadius: 2 }}
              >
                <ListItemText primary={brand.brand} />
              </ListItemButton>

              {/* MODELS */}
              {brand.uuid === brandId &&
                brand.models.map((model: any) => (
                  <div key={model.uuid}>

                    <ListItemButton
                      sx={{ pl: 4, borderRadius: 2 }}
                      selected={
                        model.uuid === modelId && !subModelId
                      }
                      onClick={() =>
                        router.push({
                          pathname: '/cars',
                          query: {
                            brand: brand.uuid,
                            model: model.uuid,
                          },
                        })
                      }
                    >
                      <ListItemText primary={model.model} />
                    </ListItemButton>

                    {/* SUBMODELS */}
                    {model.uuid === modelId &&
                      model.subModels?.map((sub: any) => (
                        <ListItemButton
                          key={sub.uuid}
                          sx={{
                            pl: 7,
                            borderRadius: 2,
                          }}
                          selected={sub.uuid === subModelId}
                          onClick={() =>
                            router.push({
                              pathname: '/cars',
                              query: {
                                brand: brand.uuid,
                                model: model.uuid,
                                subModel: sub.uuid,
                              },
                            })
                          }
                        >
                          <ListItemText
                            primary={sub.name}
                            secondary={
                              sub.body_type
                                ? `${t('cars.filters.body')}: ${getBodyTypeLabel(
                                  sub.body_type
                                )}`
                                : undefined
                            }
                          />
                        </ListItemButton>
                      ))}
                  </div>
                ))}
            </div>
          ))}
        </List>
      </Paper>
    </Grid>
  );
};
