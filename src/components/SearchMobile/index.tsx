import {
  Box,
  IconButton,
  OutlinedInput,
  InputAdornment
} from '@mui/material';
import React from 'react';
import CustomModal from '../CustomModal';
import styles from './index.module.css';
import IClose from '../Icons/IClose';
import SearchIcon from '@mui/icons-material/Search';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';

interface SearchMobileProps {
  icon: React.ReactNode;
  opened?: boolean;
}

const SearchMobile: React.FC<SearchMobileProps> = ({ icon, opened }) => {
  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const router = useRouter();
  
  const handleClose = () => {
    setOpenModal(false);
    setSearchQuery('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      handleClose();
    }
  };

  return (
    <Box>
      <IconButton 
        onClick={() => setOpenModal(true)}
        sx={{
          padding: '8px',
          '&:active': {
            transform: 'scale(0.95)'
          }
        }}
      >
        {icon}
      </IconButton>
      <CustomModal
        open={openModal}
        handleClose={handleClose}
        title="Поиск"
        width="100%"
      >
        <Box className={styles.searchContent}>
          <form onSubmit={handleSearch} style={{ width: '100%' }}>
            <OutlinedInput
              fullWidth
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#868695' }} />
                </InputAdornment>
              }
              sx={{
                borderRadius: '12px',
                backgroundColor: '#f5f5f5',
                '& fieldset': {
                  border: 'none'
                },
                '&:hover fieldset': {
                  border: 'none'
                },
                '&.Mui-focused fieldset': {
                  border: '2px solid #667eea'
                }
              }}
            />
          </form>
        </Box>
      </CustomModal>
    </Box>
  );
};

export default SearchMobile;
