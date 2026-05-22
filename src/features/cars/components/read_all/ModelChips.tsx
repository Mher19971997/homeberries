import { Box, Chip, Typography } from '@mui/material';
import { getBodyTypeLabel } from '@homeberris/features/cars/utils/bodyTypeLabel';

export const ModelChips = ({
  currentBrand,
  currentModel,
  brandId,
  modelId,
  subModelId,
  router,
}: any) => {
  if (!currentBrand) return null;

  return (
    <>
      <Typography sx={{ display: { xs: 'block', md: 'none' }, mb: 1, fontWeight: 600 }}>
        Модели
      </Typography>

      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          overflowX: 'auto',
          gap: 1,
          mb: 2,
          pb: 1,
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {currentBrand.models.map((model: any) => (
          <Chip
            key={model.uuid}
            label={model.model}
            clickable
            color={model.uuid === modelId ? 'primary' : 'default'}
            onClick={() =>
              router.push({
                pathname: '/cars',
                query: { brand: brandId, model: model.uuid },
              })
            }
          />
        ))}
      </Box>

      {currentModel?.subModels && (
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            flexWrap: 'wrap',
            gap: 1,
            mb: 2,
          }}
        >
          {currentModel.subModels.map((sub: any) => (
            <Chip
              key={sub.uuid}
              size="small"
              label={
                sub.body_type
                  ? `${sub.name} • ${getBodyTypeLabel(sub.body_type)}`
                  : sub.name
              }
              clickable
              variant={sub.uuid === subModelId ? 'filled' : 'outlined'}
              onClick={() =>
                router.push({
                  pathname: '/cars',
                  query: {
                    brand: brandId,
                    model: modelId,
                    subModel: sub.uuid,
                  },
                })
              }
            />
          ))}
        </Box>
      )}
    </>
  );
};
