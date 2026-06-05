import React from 'react';
import { useQueries } from '@tanstack/react-query';
import * as qs from 'qs';
import { BrandItem } from '@homeberris/types/brand';
import { ChevronDownIcon, SearchIconNotMUI } from '@homeberris/assets/icons/catalog';
import { getAllCatalogs } from '@homeberris/http/catalogApi';
import styles from './index.module.css';

interface SidebarFiltersProps {
  brands: BrandItem[];
  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;
  categoryName?: string;
}

const EXTRA_SECTIONS = [
  'Battery capacity',
  'Screen type',
  'Screen diagonal',
  'Protection class',
  'Built-in memory',
];

export default function SidebarFilters({ brands, selectedBrands, onBrandsChange, categoryName }: SidebarFiltersProps) {
  const [brandSearch, setBrandSearch] = React.useState('');
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    brand: true,
  });

  const brandCountQueries = useQueries({
    queries: brands.map((brand) => ({
      queryKey: ['brandCount', brand.uuid, categoryName],
      queryFn: () => getAllCatalogs(qs.stringify({
        filterMeta: { brandUuid: brand.uuid },
        ...(categoryName ? { includeMeta: [{ association: 'category', where: { name: categoryName } }] } : {}),
        queryMeta: { paginate: true, limit: 1, page: 1 },
      })),
      staleTime: 1000 * 60 * 5,
    })),
  });

  const brandCounts: Record<string, number> = {};
  brands.forEach((brand, i) => {
    brandCounts[brand.uuid] = (brandCountQueries[i]?.data as any)?.meta?.count ?? 0;
  });

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const handleToggle = (uuid: string) => {
    const next = selectedBrands.includes(uuid)
      ? selectedBrands.filter((id) => id !== uuid)
      : [...selectedBrands, uuid];
    onBrandsChange(next);
  };

  const toggle = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className={styles.wrapper}>
      {/* Brand */}
      <div className={styles.accordion}>
        <div
          className={`${styles.accordionHeader} ${openSections.brand ? styles.accordionHeaderOpen : ''}`}
          onClick={() => toggle('brand')}
        >
          <p className={styles.accordionTitle}>Brand</p>
          <ChevronDownIcon className={`${styles.chevron} ${openSections.brand ? styles.chevronOpen : ''}`} />
        </div>
        {openSections.brand && (
          <div className={styles.accordionBody}>
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
                <p className={styles.emptyText}>No brands</p>
              ) : (
                filteredBrands.map((brand) => (
                  <label key={brand.uuid} className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selectedBrands.includes(brand.uuid)}
                      onChange={() => handleToggle(brand.uuid)}
                    />
                    <span className={styles.checkboxLabel}>
                      {brand.name}
                      {brandCounts[brand.uuid] > 0 && (
                        <span className={styles.brandCount}>{brandCounts[brand.uuid]}</span>
                      )}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Extra sections */}
      {EXTRA_SECTIONS.map((label) => (
        <div key={label} className={styles.accordion}>
          <div
            className={`${styles.accordionHeader} ${openSections[label] ? styles.accordionHeaderOpen : ''}`}
            onClick={() => toggle(label)}
          >
            <p className={styles.accordionTitle}>{label}</p>
            <ChevronDownIcon className={`${styles.chevron} ${openSections[label] ? styles.chevronOpen : ''}`} />
          </div>
          {openSections[label] && (
            <div className={styles.accordionBody}>
              <p className={styles.emptyText}>No data</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
