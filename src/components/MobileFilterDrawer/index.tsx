import React from 'react';
import { Slider } from '@mui/material';
import { BrandItem } from '@homeberris/types/brand';
import { SearchIconNotMUI } from '@homeberris/assets/icons/catalog';
import styles from './index.module.css';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';

const getLoc = (val: any, locale: string): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[locale] || val.ru || '';
};

interface MobileFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  brands: BrandItem[];
  selectedBrands: string[];
  priceRange: { min: number; max: number } | null;
  onApply: (brands: string[], price: { min: number; max: number } | null, groupFilters: Record<string, string[]>) => void;
  catalogs?: any[];
  initialGroupFilters?: Record<string, string[]>;
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
  catalogs = [],
  initialGroupFilters = {},
}: MobileFilterDrawerProps) {
  const { t } = useTranslation('common');
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [brandSearch, setBrandSearch] = React.useState('');
  const [localBrands, setLocalBrands] = React.useState<string[]>(initialBrands);
  const [tempMin, setTempMin] = React.useState<number>(initialPrice?.min ?? PRICE_MIN);
  const [tempMax, setTempMax] = React.useState<number>(initialPrice?.max ?? PRICE_MAX);
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string[]>>(initialGroupFilters);

  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    price: true,
    brand: true,
  });

  const groupSections = React.useMemo(() => {
    const map = new Map<string, Set<string>>();
    catalogs.forEach((catalog: any) => {
      (catalog.groupOption || []).forEach((group: any) => {
        const groupName = getLoc(group.name, locale);
        if (!map.has(groupName)) map.set(groupName, new Set());
        (group.options || []).forEach((opt: any) => {
          const optValue = getLoc(opt.value, locale);
          if (optValue) map.get(groupName)!.add(optValue);
        });
      });
    });
    return Array.from(map.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }));
  }, [catalogs, locale]);

  React.useEffect(() => {
    if (open) {
      setLocalBrands(initialBrands);
      setTempMin(initialPrice?.min ?? PRICE_MIN);
      setTempMax(initialPrice?.max ?? PRICE_MAX);
      setSelectedOptions(initialGroupFilters);
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
    const cleanedOptions: Record<string, string[]> = {};
    Object.entries(selectedOptions).forEach(([k, v]) => {
      if (v.length > 0) cleanedOptions[k] = v;
    });
    onApply(localBrands, price, cleanedOptions);
    onClose();
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const toggleOption = (groupName: string, value: string) => {
    setSelectedOptions((prev) => {
      const current = prev[groupName] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [groupName]: updated };
    });
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayVisible : ''}`}
        onClick={onClose}
      />
      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
        {/* Navbar header */}
        <div className={styles.navHeader}>
          <span className={styles.navLogo} onClick={() => { onClose(); }}>cyber</span>
          <button
            className={styles.burgerBtn}
            aria-label="open menu"
            suppressHydrationWarning
            onClick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent('openNavMenu'));
            }}
          >
            <svg width="25" height="17" viewBox="0 0 25 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="25" height="2.5" rx="1.25" fill="#080341"/>
              <rect y="7.25" width="25" height="2.5" rx="1.25" fill="#080341"/>
              <rect y="14.5" width="25" height="2.5" rx="1.25" fill="#080341"/>
            </svg>
          </button>
        </div>

        {/* Filters header */}
        <div className={styles.header}>
          <button className={styles.backBtn} suppressHydrationWarning onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#242424" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className={styles.title}>{t('sidebarFilters.title')}</p>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Price */}
          <div className={styles.section}>
            <div className={styles.sectionHeader} onClick={() => toggleSection('price')}>
              <p className={styles.sectionTitle}>{t('sidebarFilters.price')}</p>
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
                    <span className={styles.priceLabel}>{t('sidebarFilters.from')}</span>
                    <input
                      className={styles.priceField}
                      type="number"
                      value={tempMin}
                      suppressHydrationWarning
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 0;
                        setTempMin(Math.min(v, tempMax - 1));
                      }}
                    />
                  </div>
                  <span className={styles.priceDash}>—</span>
                  <div className={styles.priceInput}>
                    <span className={`${styles.priceLabel} ${styles.priceLabelEnd}`}>{t('sidebarFilters.to')}</span>
                    <input
                      className={styles.priceField}
                      type="number"
                      value={tempMax}
                      suppressHydrationWarning
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
                    '& .MuiSlider-rail': { height: 3, backgroundColor: '#CECECE' },
                  }}
                />
              </div>
            )}
          </div>

          {/* Brand */}
          <div className={styles.section}>
            <div className={styles.sectionHeader} onClick={() => toggleSection('brand')}>
              <p className={styles.sectionTitle}>{t('sidebarFilters.brand')}</p>
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
                    placeholder={t('sidebarFilters.search')}
                    value={brandSearch}
                    suppressHydrationWarning
                    onChange={(e) => setBrandSearch(e.target.value)}
                  />
                </div>
                <div className={styles.brandList}>
                  {filteredBrands.length === 0 ? (
                    <p className={styles.emptyText}>{t('sidebarFilters.noBrands')}</p>
                  ) : (
                    filteredBrands.map((brand) => (
                      <label key={brand.uuid} className={styles.checkboxRow}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={localBrands.includes(brand.uuid)}
                          suppressHydrationWarning
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

          {/* Dynamic group sections from DB */}
          {groupSections.map(({ name, values }) => (
            <div key={name} className={styles.section}>
              <div className={styles.sectionHeader} onClick={() => toggleSection(name)}>
                <p className={styles.sectionTitle}>{name}</p>
                <svg
                  className={`${styles.chevron} ${openSections[name] ? styles.chevronOpen : ''}`}
                  width="20" height="20" viewBox="0 0 24 24" fill="none"
                >
                  <path d="M6 9L12 15L18 9" stroke="#868695" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              {openSections[name] && (
                <div className={styles.sectionContent}>
                  {values.length === 0 ? (
                    <p className={styles.emptyText}>{t('sidebarFilters.noData')}</p>
                  ) : (
                    <div className={styles.brandList}>
                      {values.map((val) => (
                        <label key={val} className={styles.checkboxRow}>
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={(selectedOptions[name] || []).includes(val)}
                            suppressHydrationWarning
                            onChange={() => toggleOption(name, val)}
                          />
                          <span className={styles.checkboxLabel}>{val}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.applyBtn} suppressHydrationWarning onClick={handleApply}>
            {t('sidebarFilters.apply')}
          </button>
        </div>
      </div>
    </>
  );
}
