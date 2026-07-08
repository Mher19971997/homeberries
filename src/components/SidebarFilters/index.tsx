import React from 'react';
import { useQueries } from '@tanstack/react-query';
import * as qs from 'qs';
import { BrandItem } from '@homeberris/types/brand';
import { ChevronDownIcon, SearchIconNotMUI } from '@homeberris/assets/icons/catalog';
import { getAllCatalogs } from '@homeberris/http/catalogApi';
import styles from './index.module.css';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';

const getLoc = (val: any, locale: string): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[locale] || val.ru || '';
};

interface SidebarFiltersProps {
  brands: BrandItem[];
  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;
  categoryName?: string;
  categoryUuid?: string;
  catalogs?: any[];
  onFiltersChange?: (filters: Record<string, string[]>) => void;
}

export default function SidebarFilters({
  brands,
  selectedBrands,
  onBrandsChange,
  categoryName,
  categoryUuid,
  catalogs = [],
  onFiltersChange,
}: SidebarFiltersProps) {
  const [brandSearch, setBrandSearch] = React.useState('');
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({ brand: true });
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string[]>>({});

  const { t } = useTranslation('common');
  const routeParams = useParams();
  const locale = (routeParams?.locale as string) || 'ru';

  const EXTRA_SECTIONS = [
    t('sidebarFilters.extraSections.batteryCapacity'),
    t('sidebarFilters.extraSections.screenType'),
    t('sidebarFilters.extraSections.screenDiagonal'),
    t('sidebarFilters.extraSections.protectionClass'),
    t('sidebarFilters.extraSections.builtInMemory'),
  ];

  const brandCountQueries = useQueries({
    queries: brands.map((brand) => ({
      queryKey: ['brandCount', brand.uuid, categoryUuid],
      queryFn: () => getAllCatalogs(qs.stringify({
        filterMeta: {
          brandUuid: brand.uuid,
          ...(categoryUuid ? { categoryUuid } : {}),
        },
        queryMeta: { paginate: true, limit: 1, page: 1 },
      })),
      staleTime: 1000 * 60 * 5,
    })),
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

  const brandCounts: Record<string, number> = {};
  brands.forEach((brand, i) => {
    brandCounts[brand.uuid] = (brandCountQueries[i]?.data as any)?.meta?.count ?? 0;
  });

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const handleToggleBrand = (uuid: string) => {
    const next = selectedBrands.includes(uuid)
      ? selectedBrands.filter((id) => id !== uuid)
      : [...selectedBrands, uuid];
    onBrandsChange(next);
  };

  const handleToggleOption = (groupName: string, value: string) => {
    const current = selectedOptions[groupName] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    const updated = { ...selectedOptions, [groupName]: next };
    if (next.length === 0) delete updated[groupName];
    setSelectedOptions(updated);
    onFiltersChange?.(updated);
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
          <p className={styles.accordionTitle}>{t('sidebarFilters.brand')}</p>
          <ChevronDownIcon className={`${styles.chevron} ${openSections.brand ? styles.chevronOpen : ''}`} />
        </div>
        {openSections.brand && (
          <div className={styles.accordionBody}>
            <div className={styles.searchBox}>
              <SearchIconNotMUI />
              <input
                className={styles.searchInput}
                placeholder={t('sidebarFilters.search')}
                value={brandSearch}
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
                      checked={selectedBrands.includes(brand.uuid)}
                      onChange={() => handleToggleBrand(brand.uuid)}
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

      {/* Динамические секции из groupOption */}
      {groupSections.map(({ name, values }) => (
        <div key={name} className={styles.accordion}>
          <div
            className={`${styles.accordionHeader} ${openSections[name] ? styles.accordionHeaderOpen : ''}`}
            onClick={() => toggle(name)}
          >
            <p className={styles.accordionTitle}>{name}</p>
            <ChevronDownIcon className={`${styles.chevron} ${openSections[name] ? styles.chevronOpen : ''}`} />
          </div>
          {openSections[name] && (
            <div className={styles.accordionBody}>
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
                        onChange={() => handleToggleOption(name, val)}
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
  );
}
