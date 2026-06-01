import React from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  InputBase,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { BrandItem } from '@homeberris/types/brand';
import { SearchIconNotMUI } from '@homeberris/assets/icons/catalog';

interface SidebarFiltersProps {
  brands: BrandItem[];
  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;
}

export default function SidebarFilters({ brands, selectedBrands, onBrandsChange }: SidebarFiltersProps) {
  const [brandSearch, setBrandSearch] = React.useState('');

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const handleToggle = (uuid: string) => {
    const next = selectedBrands.includes(uuid)
      ? selectedBrands.filter((id) => id !== uuid)
      : [...selectedBrands, uuid];
    onBrandsChange(next);
  };

  return (
    <Box sx={{ border: '0px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', bgcolor: '#fff' }}>

      {/* Brand */}
      <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, py: 1.5, borderBottom: '1px solid #B5B5B5' }}>
          <Typography sx={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '18px', lineHeight: '24px', letterSpacing: '0.03em' }}>Brand</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0, py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: 'none', borderRadius: '8px', px: 1, py: 0.5, mb: 1,background:'#F5F5F5' }}>
            <SearchIconNotMUI/>
            <InputBase
              placeholder="Search"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              sx={{ fontSize: '14px', flex: 1}}
            />
          </Box>
          <Box sx={{ maxHeight: 220, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#e0e0e0', borderRadius: 2 } }}>
            {filteredBrands.map((brand) => (
              <FormControlLabel
                key={brand.uuid}
                control={
                  <Checkbox
                    checked={selectedBrands.includes(brand.uuid)}
                    onChange={() => handleToggle(brand.uuid)}
                    size="small"
                    sx={{ py: 0.3, color: '#ccc', '&.Mui-checked': { color: '#1a1a1a' } }}
                  />
                }
                label={<Typography sx={{ fontSize: '13px', color: '#333' }}>{brand.name}</Typography>}
                sx={{ display: 'flex', mx: 0, py: 0.2 }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* <Divider /> */}

      {['Battery capacity', 'Screen type', 'Screen diagonal', 'Protection class', 'Built-in memory'].map((label, index) => (
        <Accordion key={label} disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, borderTop: index === 0 ? 'none' : '1px solid #B5B5B5' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, py: 1.2 }}>
            <Typography sx={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '18px', lineHeight: '24px', letterSpacing: '0.03em', color: '#333' }}>{label}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, py: 1 }}>
            <Typography sx={{ fontSize: '13px', color: '#999' }}>Нет данных</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
