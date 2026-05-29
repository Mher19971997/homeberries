import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  CircularProgress,
  Grid
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getCarMenu, CarMenuBrand, CarMenuModel, CarMenuSubModel } from '@homeberris/http/carApi';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import styles from './index.module.css';

interface CarMenuDropdownProps {
  onBrandSelect?: (brand: CarMenuBrand) => void;
  onModelSelect?: (model: CarMenuModel) => void;
  onSubModelSelect?: (subModel: CarMenuSubModel) => void;
  onCloseMenu?: () => void;
}

const CarMenuDropdown: React.FC<CarMenuDropdownProps> = ({
  onBrandSelect,
  onModelSelect,
  onSubModelSelect,
  onCloseMenu
}) => {
  const router = useRouter();
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  const [modelPosition, setModelPosition] = useState({ top: 0, left: 0 });
  const [subModelPosition, setSubModelPosition] = useState({ top: 0, left: 0 });
  const [isClient, setIsClient] = useState(false);
  const brandRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const modelRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const modelPanelRef = useRef<HTMLDivElement>(null);
  const subModelPanelRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    data: carMenu,
    isLoading: isLoadingMenu
  } = useQuery({ queryKey: ['getCarMenu'], queryFn: getCarMenu });

  const brands = carMenu || [];

  const handleBrandMouseEnter = (brand: CarMenuBrand, event: React.MouseEvent<HTMLElement>) => {
    if (!isClient) return;

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    setHoveredBrand(brand.uuid);
    setHoveredModel(null);
    onBrandSelect?.(brand);

    if (typeof window !== 'undefined') {
      setModelPosition({
        top: 0,
        left: 300
      });
    }
  };

  const handleBrandMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    if (!isClient) return;

    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget && modelPanelRef.current?.contains(relatedTarget)) {
      return;
    }

    hoverTimeoutRef.current = setTimeout(() => {
      if (modelPanelRef.current && typeof window !== 'undefined') {
        const panelElement = modelPanelRef.current;
        if (!panelElement.matches(':hover')) {
          setHoveredBrand(null);
          setHoveredModel(null);
        }
      }
    }, 150);
  };

  const handleModelMouseEnter = (model: CarMenuModel, event: React.MouseEvent<HTMLElement>) => {
    if (!isClient) return;

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    setHoveredModel(model.uuid);
    onModelSelect?.(model);

    if (typeof window !== 'undefined') {
      setSubModelPosition({
        top: 0,
        left: 600
      });
    }
  };

  const handleModelMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    if (!isClient) return;

    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget && subModelPanelRef.current?.contains(relatedTarget)) {
      return;
    }

    hoverTimeoutRef.current = setTimeout(() => {
      if (subModelPanelRef.current && typeof window !== 'undefined') {
        const panelElement = subModelPanelRef.current;
        if (!panelElement.matches(':hover')) {
          setHoveredModel(null);
        }
      }
    }, 150);
  };

  const handleSubModelClick = (subModel: CarMenuSubModel, brand: CarMenuBrand, model: CarMenuModel) => {
    onSubModelSelect?.(subModel);
    router.push(`/cars?brand=${brand.uuid}&model=${model.uuid}&subModel=${subModel.uuid}`);
    onCloseMenu?.();
  };

  const handleModelClick = (model: CarMenuModel, brand: CarMenuBrand) => {
    if (model.subModels && model.subModels.length > 0) {
      return; // Если есть подмодели, не переходим сразу
    }
    router.push(`/cars?brand=${brand.uuid}&model=${model.uuid}`);
    onCloseMenu?.();
  };

  const handleBrandClick = (brand: CarMenuBrand) => {
    if (brand.models && brand.models.length > 0) {
      return; // Если есть модели, не переходим сразу
    }
    router.push(`/cars?brand=${brand.uuid}`);
    onCloseMenu?.();
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  if (!isClient || isLoadingMenu) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  const currentBrand = brands.find(b => b.uuid === hoveredBrand);
  const currentModel = currentBrand?.models.find(m => m.uuid === hoveredModel);

  return (
    <Box className={styles.carMenuContainer}>
      <List className={styles.brandList}>
        {brands.map((brand) => (
          <ListItem
            key={brand.uuid}
            disablePadding
            onMouseEnter={(e) => handleBrandMouseEnter(brand, e)}
            onMouseLeave={handleBrandMouseLeave}
            ref={(el) => {
              brandRefs.current[brand.uuid] = el;
            }}
          >
            <ListItemButton
              className={`${styles.brandItem} ${hoveredBrand === brand.uuid ? styles.active : ''}`}
              onClick={() => handleBrandClick(brand)}
            >
              <ListItemText
                primary={brand.brand}
                primaryTypographyProps={{
                  className: styles.brandText
                }}
              />
              {brand.models && brand.models.length > 0 && (
                <ArrowForwardIosIcon className={styles.arrowIcon} />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Панель моделей */}
      {currentBrand && currentBrand.models && currentBrand.models.length > 0 && (
        <Paper
          ref={modelPanelRef}
          className={styles.modelPanel}
          style={{
            position: 'fixed',
            top: modelPosition.top,
            left: modelPosition.left,
            zIndex: 1000,
            minWidth: 300,
            height: '100vh',
            maxHeight: '100vh',
            overflowY: 'auto'
          }}
          onMouseLeave={() => {
            hoverTimeoutRef.current = setTimeout(() => {
              if (subModelPanelRef.current && typeof window !== 'undefined') {
                const panelElement = subModelPanelRef.current;
                if (!panelElement.matches(':hover')) {
                  setHoveredBrand(null);
                  setHoveredModel(null);
                }
              }
            }, 150);
          }}
        >
          <Box className={styles.panelHeader}>
            <Typography variant="h6" className={styles.panelTitle}>
              {currentBrand.brand}
            </Typography>
          </Box>
          <List>
            {currentBrand.models.map((model) => (
              <ListItem
                key={model.uuid}
                disablePadding
                onMouseEnter={(e) => handleModelMouseEnter(model, e)}
                onMouseLeave={handleModelMouseLeave}
                ref={(el) => {
                  modelRefs.current[model.uuid] = el;
                }}
              >
                <ListItemButton
                  className={`${styles.modelItem} ${hoveredModel === model.uuid ? styles.active : ''}`}
                  onClick={() => handleModelClick(model, currentBrand)}
                >
                  <ListItemText
                    primary={model.model}
                    primaryTypographyProps={{
                      className: styles.modelText
                    }}
                  />
                  {model.subModels && model.subModels.length > 0 && (
                    <ArrowForwardIosIcon className={styles.arrowIcon} />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Панель подмоделей */}
      {currentModel && currentModel.subModels && currentModel.subModels.length > 0 && (
        <Paper
          ref={subModelPanelRef}
          className={styles.subModelPanel}
          style={{
            position: 'fixed',
            top: subModelPosition.top,
            left: subModelPosition.left,
            zIndex: 1001,
            minWidth: 300,
            height: '100vh',
            maxHeight: '100vh',
            overflowY: 'auto'
          }}
          onMouseLeave={() => {
            hoverTimeoutRef.current = setTimeout(() => {
              setHoveredModel(null);
            }, 150);
          }}
        >
          <Box className={styles.panelHeader}>
            <Typography variant="h6" className={styles.panelTitle}>
              {currentModel.model}
            </Typography>
          </Box>
          <List>
            {currentModel.subModels.map((subModel) => (
              <ListItem key={subModel.uuid} disablePadding>
                <ListItemButton
                  className={styles.subModelItem}
                  onClick={() => handleSubModelClick(subModel, currentBrand!, currentModel)}
                >
                  <ListItemText
                    primary={subModel.name}
                    secondary={subModel.generation || subModel.body_type}
                    primaryTypographyProps={{
                      className: styles.subModelText
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default CarMenuDropdown;
