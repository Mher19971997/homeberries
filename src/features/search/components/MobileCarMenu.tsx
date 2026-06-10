import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  IconButton,
  Box,
  CircularProgress
} from '@mui/material';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import {
  CarMenuBrand,
  CarMenuModel
} from '@homeberris/http/carApi';

interface Props {
  car_brands: CarMenuBrand[];
  onCloseMenu?: () => void;
  isLoading: boolean
}

const MobileCarMenu: React.FC<Props> = ({ onCloseMenu, car_brands, isLoading }) => {
  const router = useRouter();
  const [openBrands, setOpenBrands] = useState<string[]>([]);
  const [openModels, setOpenModels] = useState<string[]>([]);

  const toggle = (id: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const redirect = (url: string) => {
    router.push(url);
    onCloseMenu?.();
  };

  if (isLoading) {
    return (
      <Box p={3} textAlign="center">
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <List>
      {car_brands?.map((brand: CarMenuBrand) => {
        const hasModels = brand.models?.length > 0;
        const brandOpen = openBrands.includes(brand.uuid);

        return (
          <Box key={brand.uuid}>
            <ListItem disablePadding>
              {/* TEXT → redirect */}
              <ListItemButton
                onClick={() => redirect(`/cars?brand=${brand.uuid}`)}
                sx={{ flex: 1 }}
              >
                <ListItemText primary={brand.brand} />
              </ListItemButton>

              {/* ARROW → expand */}
              {hasModels && (
                <IconButton
                  onClick={(e: any) => {
                    e.stopPropagation();
                    toggle(brand.uuid, setOpenBrands);
                  }}
                >
                  {brandOpen ? <ExpandMore /> : <ChevronRight />}
                </IconButton>
              )}
            </ListItem>

            {hasModels && (
              <Collapse in={brandOpen} timeout="auto" unmountOnExit>
                {brand.models.map((model: CarMenuModel) => {
                  const hasSub = model.subModels?.length > 0;
                  const modelOpen = openModels.includes(model.uuid);

                  return (
                    <Box key={model.uuid}>
                      <ListItem disablePadding sx={{ pl: 3 }}>
                        {/* TEXT → redirect */}
                        <ListItemButton
                          onClick={() => redirect(`/cars?brand=${brand.uuid}&model=${model.uuid}`)}
                          sx={{ flex: 1 }}
                        >
                          <ListItemText primary={model.model} />
                        </ListItemButton>

                        {/* ARROW → expand */}
                        {hasSub && (
                          <IconButton
                            onClick={(e: any) => {
                              e.stopPropagation();
                              toggle(model.uuid, setOpenModels);
                            }}
                          >
                            {modelOpen ? <ExpandMore /> : <ChevronRight />}
                          </IconButton>
                        )}
                      </ListItem>

                      {hasSub && (
                        <Collapse in={modelOpen} timeout="auto" unmountOnExit>
                          {model.subModels.map((sub) => (
                            <ListItem
                              key={sub.uuid}
                              disablePadding
                              sx={{ pl: 6 }}
                            >
                              <ListItemButton onClick={() => redirect(`/cars?brand=${brand.uuid}&model=${model.uuid}&subModel=${sub.uuid}`)}>
                                <ListItemText
                                  primary={sub.name}
                                  secondary={sub.generation || sub.body_type}
                                />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </Collapse>
                      )}
                    </Box>
                  );
                })}
              </Collapse>
            )}
          </Box>
        );
      })}
    </List>
  );
};

export default MobileCarMenu;