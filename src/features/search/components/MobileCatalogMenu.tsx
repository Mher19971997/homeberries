import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  IconButton,
  Box,
} from '@mui/material';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { CategoryItem, SubCategoryItem } from '@homeberris/types/category';

interface Props {
  categories: CategoryItem[];
  onCloseMenu?: () => void;
}

const MobileCatalogMenu: React.FC<Props> = ({
  categories,
  onCloseMenu,
}) => {
  const router = useRouter();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleOpen = (uuid: string) => {
    setOpenItems((prev) =>
      prev.includes(uuid)
        ? prev.filter((id) => id !== uuid)
        : [...prev, uuid]
    );
  };

  const handleRedirect = (url: string) => {
    router.push(url);
    onCloseMenu?.();
  };

  const renderSubCategories = (
    subCategories: SubCategoryItem[],
    parentUrl: string,
    level = 0
  ) => {
    return subCategories.map((sub: SubCategoryItem) => {
      const hasChildren = (sub?.children?.length ?? 0) > 0;
      const isOpen = openItems.includes(sub.uuid);

      return (
        <Box key={sub.uuid}>
          <ListItem
            disablePadding
            sx={{ pl: 2 + level * 2 }}
          >
            {/* НАЗВАНИЕ → redirect */}
            <ListItemButton
              onClick={() =>
                handleRedirect(`${parentUrl}/${sub.name}`)
              }
              sx={{ flex: 1 }}
            >
              <ListItemText primary={sub.name} />
            </ListItemButton>

            {/* СТРЕЛКА → раскрытие */}
            {hasChildren && (
              <IconButton
                size="small"
                onClick={(e: any) => {
                  e.stopPropagation();
                  toggleOpen(sub.uuid);
                }}
              >
                {isOpen ? <ExpandMore /> : <ChevronRight />}
              </IconButton>
            )}
          </ListItem>

          {hasChildren && (
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              {renderSubCategories(
                sub.children!,
                `${parentUrl}/${sub.name}`,
                level + 1
              )}
            </Collapse>
          )}
        </Box>
      );
    });
  };

  return (
    <List>
      {categories.map((category: CategoryItem) => {
        const hasSub = (category.subCategories?.length ?? 0) > 0;
        const isOpen = openItems.includes(category.uuid);

        return (
          <Box key={category.uuid}>
            <ListItem disablePadding>
              {/* НАЗВАНИЕ → redirect */}
              <ListItemButton
                onClick={() =>
                  handleRedirect(`/catalog/${category.name}`)
                }
                sx={{ flex: 1 }}
              >
                <ListItemText primary={category.name} />
              </ListItemButton>

              {/* СТРЕЛКА → раскрытие */}
              {hasSub && (
                <IconButton
                  size="small"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    toggleOpen(category.uuid);
                  }}
                >
                  {isOpen ? <ExpandMore /> : <ChevronRight />}
                </IconButton>
              )}
            </ListItem>

            {hasSub && (
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                {renderSubCategories(
                  category.subCategories!,
                  `/catalog/${category.name}`
                )}
              </Collapse>
            )}
          </Box>
        );
      })}
    </List>
  );
};

export default MobileCatalogMenu;
