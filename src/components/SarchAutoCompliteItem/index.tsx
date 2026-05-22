import { Box, Typography } from '@mui/material';
import React from 'react';
import styles from '@homeberris/components/SarchAutoCompliteItem/index.module.css';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useRouter } from 'next/router';

interface SarchAutoCompliteItemProps {
  name: string;
  uuid: string;
  catalogName?: string;
  categoryName?: string;
  subCategoryName?: string;
  type?: 'category' | 'catalog' | 'car';
  checkSearch: boolean;
  setCheckSearch: any;
  setCatalogName: any;
}

const SarchAutoCompliteItem: React.FC<SarchAutoCompliteItemProps> = ({
  name,
  uuid,
  catalogName = '',
  categoryName,
  subCategoryName,
  type = 'catalog',
  setCheckSearch,
  setCatalogName
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (type === 'category') {
      router.push(`/catalog/${encodeURIComponent(name)}`);
    } else if (type === 'catalog') {
      // Для товара используем категорию и подкатегорию если доступны
      const catName = categoryName || name;
      if (subCategoryName) {
        router.push(`/catalog/${encodeURIComponent(catName)}/${encodeURIComponent(subCategoryName)}/${uuid}`);
      } else {
        // Fallback к старой структуре если нет подкатегории
        router.push(`/catalog/${encodeURIComponent(catName)}/${uuid}`);
      }
    } else if (type === 'car') {
      router.push(`/cars/${uuid}`);
    }
    setCheckSearch(false);
    setCatalogName('');
  };

  const highlightText = (text: string, search: string) => {
    if (!search) return text;
    
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, index) => (
      <span
        key={index}
        style={{
          fontWeight: part.toLowerCase() === search.toLowerCase() ? 'bold' : 'normal',
          color: part.toLowerCase() === search.toLowerCase() ? '#667eea' : '#242424'
        }}
      >
        {part}
      </span>
    ));
  };

  return (
    <Box
      className={styles.box}
      onClick={handleClick}
    >
      {type === 'category' ? (
        <FolderIcon className={styles.categoryIcon} />
      ) : (
        <InventoryIcon className={styles.catalogIcon} />
      )}
      <Typography className={styles.itemText}>
        {highlightText(name, catalogName)}
      </Typography>
    </Box>
  );
};

export default SarchAutoCompliteItem;
