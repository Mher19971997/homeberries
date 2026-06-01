import React from 'react';
import { Divider, Slider } from '@mui/material';
import { BrandItem } from '@homeberris/types/brand';
import { SearchIconNotMUI } from '@homeberris/assets/icons/catalog';
import styles from './index.module.css';

interface MobileFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  brands: BrandItem[];
  selectedBrands: string[];
  priceRange: { min: number; max: number } | null;
  onApply: (brands: string[], price: { min: number; max: number } | null) => void;
}

const PRICE_MIN = 0;
const PRICE_MAX = 100000000;

export default function MobileFilterDrawer({
  open,
  onClose,
  brands,
  selectedBrands: initialBrands,
  priceRange: initialPrice,
  onApply,
}: MobileFilterDrawerProps) {
  const [brandSearch, setBrandSearch] = React.useState('');
  const [localBrands, setLocalBrands] = React.useState<string[]>(initialBrands);
  const [tempMin, setTempMin] = React.useState<number>(initialPrice?.min ?? PRICE_MIN);
  const [tempMax, setTempMax] = React.useState<number>(initialPrice?.max ?? PRICE_MAX);

  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    price: true,
    brand: true,
    memory: false,
    protection: false,
    diagonal: false,
    screenType: false,
    battery: false,
  });

  React.useEffect(() => {
    if (open) {
      setLocalBrands(initialBrands);
      setTempMin(initialPrice?.min ?? PRICE_MIN);
      setTempMax(initialPrice?.max ?? PRICE_MAX);
    }
  }, [open]);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleBrand = (uuid: string) => {
    setLocalBrands((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid]
    );
  };

  const handleApply = () => {
    const price =
      tempMin === PRICE_MIN && tempMax === PRICE_MAX
        ? null
        : { min: tempMin, max: tempMax };
    onApply(localBrands, price);
    onClose();
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const extraSections = [
    { key: 'memory', label: 'Built-in memory' },
    { key: 'protection', label: 'Protection class' },
    { key: 'diagonal', label: 'Screen diagonal' },
    { key: 'screenType', label: 'Screen type' },
    { key: 'battery', label: 'Battery capacity' },
  ];

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayVisible : ''}`}
        onClick={onClose}
      />
      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#242424" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className={styles.title}>Filters</p>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Price */}
          <div className={styles.section}>
            <div className={styles.sectionHeader} onClick={() => toggleSection('price')}>
              <p className={styles.sectionTitle}>Price</p>
              <svg
                className={`${styles.chevron} ${openSections.price ? styles.chevronOpen : ''}`}
                width="20" height="20" viewBox="0 0 24 24" fill="none"
              >
                <path d="M6 9L12 15L18 9" stroke="#868695" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            {openSections.price && (
              <div className={styles.sectionContent}>
                <div className={styles.priceInputs}>
                  <div className={styles.priceInput}>
                    <span className={styles.priceLabel}>From</span>
                    <input
                      className={styles.priceField}
                      type="number"
                      value={tempMin}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 0;
                        setTempMin(Math.min(v, tempMax - 1));
                      }}
                    />
                  </div>
                  <span className={styles.priceDash}>—</span>
                  <div className={styles.priceInput}>
                    <span className={`${styles.priceLabel} ${styles.priceLabelEnd}`}>To</span>
                    <input
                      className={styles.priceField}
                      type="number"
                      value={tempMax}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || PRICE_MAX;
                        setTempMax(Math.max(v, tempMin + 1));
                      }}
                    />
                  </div>
                </div>
                <Slider
                  value={[tempMin, tempMax]}
                  onChange={(_, val) => {
                    const [min, max] = val as number[];
                    setTempMin(min);
                    setTempMax(max);
                  }}
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={1000}
                  sx={{
                    color: '#000000',
                    height: 3,
                    '& .MuiSlider-thumb': {
                      width: 16,
                      height: 16,
                      backgroundColor: '#000000',
                      border: 'none',
                      boxShadow: 'none',
                      '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 6px rgba(0,0,0,0.1)' },
                    },
                    '& .MuiSlider-track': { height: 3, border: 'none' },
                    '& .MuiSlider-rail': { height: 3, backgroundColor: '#e0e0e0' },
                  }}
                />
              </div>
            )}
          </div>

          {/* Brand */}
          <div className={styles.section}>
            <div className={styles.sectionHeader} onClick={() => toggleSection('brand')}>
              <p className={styles.sectionTitle}>Brand</p>
              <svg
                className={`${styles.chevron} ${openSections.brand ? styles.chevronOpen : ''}`}
                width="20" height="20" viewBox="0 0 24 24" fill="none"
              >
                <path d="M6 9L12 15L18 9" stroke="#868695" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            {openSections.brand && (
              <div className={styles.sectionContent}>
                <div className={styles.searchBox}>
                  <SearchIconNotMUI />
                  <input
                    className={styles.searchInput}
                    placeholder="Search"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                  />
                </div>
                <div className={styles.brandList}>
                  {filteredBrands.length === 0 ? (
                    <p className={styles.emptyText}>No brands found</p>
                  ) : (
                    filteredBrands.map((brand) => (
                      <label key={brand.uuid} className={styles.checkboxRow}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={localBrands.includes(brand.uuid)}
                          onChange={() => toggleBrand(brand.uuid)}
                        />
                        <span className={styles.checkboxLabel}>{brand.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Extra sections */}
          {extraSections.map(({ key, label }) => (
            <div key={key} className={styles.section}>
              <div className={styles.sectionHeader} onClick={() => toggleSection(key)}>
                <p className={styles.sectionTitle}>{label}</p>
                <svg
                  className={`${styles.chevron} ${openSections[key] ? styles.chevronOpen : ''}`}
                  width="20" height="20" viewBox="0 0 24 24" fill="none"
                >
                  <path d="M6 9L12 15L18 9" stroke="#868695" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              {openSections[key] && (
                <div className={styles.sectionContent}>
                  <p className={styles.emptyText}>No data</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.applyBtn} onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
