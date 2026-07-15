'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useQueries, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'next/navigation';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import * as qs from 'qs';

import { useCompare } from '@homeberris/context/compareContext';
import { getCatalogByUud, getAllCatalogs } from '@homeberris/http/catalogApi';
import { getCategories } from '@homeberris/http/categoryApi';
import { insertBasket } from '@homeberris/http/basketApi';
import { addToBasket } from '@homeberris/utils/indexedDB';
import { checkToken, getToken } from '@homeberris/utils/auth';
import { useFormatPrice } from '@homeberris/utils/formatPrice';
import { useDebounce } from '@homeberris/hooks/useDebounce';
import { useToast } from '@homeberris/hooks/useToast';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import Breadcrumb from '@homeberris/components/Breadcrumb';
import { ScaleIcon } from '@homeberris/assets/icons/compare';
import { CatalogItem } from '@homeberris/types/catalog';
import styles from './index.module.css';
import { CartIcon } from '@homeberris/assets/icons/navbar';
import { Sparkles, Lock } from 'lucide-react';
import { compare, ComparisonResult, LocalizedText } from '@homeberris/http/aiRecApi';

const getLoc = (val: any, locale: string): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[locale] || val.ru || '';
};

const buildCatalogUrl = (catalog: CatalogItem): string => {
  const cat = getLoc((catalog as any).category?.name, 'en');
  const sub = getLoc((catalog as any).subCategorie?.name, 'en');
  const uuid = catalog.uuid;
  if (cat && sub) return `/catalog/${encodeURIComponent(cat)}/${encodeURIComponent(sub)}/${uuid}`;
  if (cat) return `/catalog/${encodeURIComponent(cat)}/${uuid}`;
  return `/catalog`;
};

const MAX_SLOTS = 4;

// Пытается выделить ведущее число из строки характеристики (например "5000mAh" -> 5000)
const parseLeadingNumber = (val: string): number | null => {
  const match = val?.match(/^[\s]*([\d]+(?:[.,]\d+)?)/);
  if (!match) return null;
  return parseFloat(match[1].replace(',', '.'));
};

function ComparePage() {
  const { t } = useTranslation('common');
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params?.locale as string) ?? 'ru';
  const [cookies] = useCookies(['token']);
  const queryClient = useQueryClient();
  const { formatPrice } = useFormatPrice();
  const { items, removeFromCompare, clearCompare, toggleCompare, loadFromShare } = useCompare();
  const { showToast } = useToast();
  const isAuth = checkToken();

  const [diffOnly, setDiffOnly] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [showSearchDropdown, setShowSearchDropdown] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchValue, 300);

  // Загрузка списка сравнения из ссылки (?ids=uuid1,uuid2,...)
  const sharedLoadedRef = React.useRef(false);
  React.useEffect(() => {
    if (sharedLoadedRef.current) return;
    const idsParam = searchParams?.get('ids');
    if (idsParam) {
      sharedLoadedRef.current = true;
      loadFromShare(idsParam.split(',').filter(Boolean));
    }
  }, [searchParams, loadFromShare]);

  const queries = useQueries({
    queries: items.map((item) => ({
      queryKey: ['compareProduct', item.uuid],
      queryFn: () => getCatalogByUud(item.uuid, ''),
      enabled: !!item.uuid,
    })),
  });

  const products: CatalogItem[] = queries
    .map((q) => q.data)
    .filter(Boolean) as CatalogItem[];

  // Вкладки-фильтры по категориям (как на domey.cz/compare): показываем ВСЕ
  // категории каталога (со счётчиком 0, если в сравнении пока ничего нет),
  // а не только те, что уже добавлены.
  const { data: allCategoriesData } = useQuery({
    queryKey: ['allCategoriesForCompare'],
    queryFn: getCategories,
  });

  const categories = React.useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      const uuid = (p as any).category?.uuid || (p as any).categoryUuid;
      if (!uuid) return;
      counts.set(uuid, (counts.get(uuid) || 0) + 1);
    });
    return (allCategoriesData?.data || []).map((c: any) => ({
      uuid: c.uuid,
      label: getLoc(c.name, locale) || c.uuid,
      count: counts.get(c.uuid) || 0,
    }));
  }, [allCategoriesData, products, locale]);

  const [activeCategoryUuid, setActiveCategoryUuid] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (categories.length === 0) {
      setActiveCategoryUuid(null);
      return;
    }
    if (!categories.some((c) => c.uuid === activeCategoryUuid)) {
      const firstWithItems = categories.find((c) => c.count > 0);
      setActiveCategoryUuid((firstWithItems || categories[0]).uuid);
    }
  }, [categories, activeCategoryUuid]);

  const displayedProducts = React.useMemo(
    () => products.filter((p) => ((p as any).category?.uuid || (p as any).categoryUuid) === activeCategoryUuid),
    [products, activeCategoryUuid],
  );

  const compareUuids = React.useMemo(
    () => displayedProducts.map((p) => p.uuid).slice().sort(),
    [displayedProducts],
  );

  const pickLoc = (val: LocalizedText | undefined, locale: string): string => {
  if (!val) return '';
  return (val as any)[locale] || val.ru || '';
};

  const { data: aiComparison, isLoading: aiLoading, isFetching: aiFetching } = useQuery({
    queryKey: ['aiCompare', ...compareUuids],
    queryFn: () => compare({ products: displayedProducts }),
    enabled: isAuth && compareUuids.length >= 2 && !!cookies.token,
    staleTime: 5 * 60 * 1000,
  });

  // Всегда показываем MAX_SLOTS колонок — занятые товаром или пустые плейсхолдеры.
  const slots: (CatalogItem | null)[] = React.useMemo(() => {
    const arr: (CatalogItem | null)[] = [...displayedProducts];
    while (arr.length < MAX_SLOTS) arr.push(null);
    return arr.slice(0, MAX_SLOTS);
  }, [displayedProducts]);

  const { data: searchResults } = useQuery({
    queryKey: ['compareSearch', debouncedSearch],
    queryFn: () => getAllCatalogs(qs.stringify({
      filterMeta: { name: { iLike: `%${debouncedSearch}%` } },
      queryMeta: { paginate: true, limit: 8 },
    })),
    enabled: debouncedSearch.length >= 2,
  });

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddFromSearch = (catalog: CatalogItem) => {
    toggleCompare(catalog);
    setSearchValue('');
    setShowSearchDropdown(false);
  };

  const handleShare = async () => {
    if (displayedProducts.length === 0) return;
    const url = `${window.location.origin}${window.location.pathname}?ids=${displayedProducts.map((p) => p.uuid).join(',')}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast(t('compare.linkCopied'), 'success');
    } catch {
      showToast(url, 'success');
    }
  };

  const { mutate: addToCart } = useMutation({
    mutationFn: async (product: CatalogItem) => {
      if (isAuth) {
        await insertBasket({ catalogUuid: product.uuid, quantity: 1 }, getToken() || cookies.token);
      } else {
        await addToBasket(product, 1);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['basketCount'] });
      queryClient.invalidateQueries({ queryKey: ['getAllBaskets'] });
      window.dispatchEvent(new Event('basketUpdated'));
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  // Группы характеристик берутся из catalog.groupOption (тот же источник, что и
  // на странице товара в ProductDetailsSection) — productSpecs сейчас не заполняется.
  const specGroups = React.useMemo(() => {
    const groupOrder: string[] = [];
    const groupRows = new Map<string, Map<string, string>>(); // groupKey -> (rowKey -> rowLabel)

    displayedProducts.forEach((p) => {
      ((p as any).groupOption || []).forEach((g: any) => {
        const groupKey = typeof g.name === 'string' ? g.name : (g.name?.ru || getLoc(g.name, locale));
        const groupLabel = getLoc(g.name, locale);
        if (!groupLabel) return;
        if (!groupRows.has(groupKey)) {
          groupRows.set(groupKey, new Map());
          groupOrder.push(groupKey);
        }
        const rows = groupRows.get(groupKey)!;
        (g.options || []).forEach((o: any) => {
          const rowKey = typeof o.name === 'string' ? o.name : (o.name?.ru || getLoc(o.name, locale));
          const rowLabel = getLoc(o.name, locale);
          if (rowLabel && !rows.has(rowKey)) rows.set(rowKey, rowLabel);
        });
      });
    });

    return groupOrder.map((groupKey) => ({
      groupKey,
      groupLabel: getLoc(
        displayedProducts.flatMap((p: any) => p.groupOption || []).find((g: any) =>
          (typeof g.name === 'string' ? g.name : g.name?.ru) === groupKey
        )?.name,
        locale,
      ),
      rows: Array.from(groupRows.get(groupKey)!.entries()),
    }));
  }, [displayedProducts, locale]);

  const getSpecValue = (product: CatalogItem, groupKey: string, rowKey: string): string => {
    const group = ((product as any).groupOption || []).find((g: any) =>
      (typeof g.name === 'string' ? g.name : g.name?.ru) === groupKey
    );
    if (!group) return '';
    const option = (group.options || []).find((o: any) =>
      (typeof o.name === 'string' ? o.name : o.name?.ru) === rowKey
    );
    return option ? getLoc(option.value, locale) : '';
  };

  // Строка считается "отличающейся", если хотя бы у одного товара значение
  // отличается от остальных (пустые значения в расчёт не берём как "совпадение").
  const isRowDifferent = (groupKey: string, rowKey: string): boolean => {
    const values = displayedProducts.map((p) => getSpecValue(p, groupKey, rowKey));
    return new Set(values).size > 1;
  };

  // Если все значения в строке — числа, подсвечиваем товар с наибольшим значением.
  const getBestUuid = (groupKey: string, rowKey: string): string | null => {
    const parsed = displayedProducts.map((p) => ({
      uuid: p.uuid,
      num: parseLeadingNumber(getSpecValue(p, groupKey, rowKey)),
    }));
    if (parsed.some((v) => v.num === null) || parsed.length < 2) return null;
    const max = Math.max(...parsed.map((v) => v.num as number));
    const maxCount = parsed.filter((v) => v.num === max).length;
    if (maxCount !== 1) return null;
    return parsed.find((v) => v.num === max)!.uuid as string;
  };

  const searchBox = (
    <div className={styles.searchWrap} ref={searchRef}>
      <input
        className={styles.searchInput}
        placeholder={t('compare.searchPlaceholder')}
        value={searchValue}
        onChange={(e) => { setSearchValue(e.target.value); setShowSearchDropdown(true); }}
        onFocus={() => searchValue.length >= 2 && setShowSearchDropdown(true)}
      />
      {showSearchDropdown && debouncedSearch.length >= 2 && (
        <div className={styles.searchDropdown}>
          {searchResults?.data && searchResults.data.length > 0 ? (
            searchResults.data.map((item: CatalogItem) => (
              <div
                key={item.uuid}
                className={styles.searchDropdownItem}
                onClick={() => handleAddFromSearch(item)}
              >
                {getLoc(item.name, locale)}
              </div>
            ))
          ) : (
            <div className={styles.searchDropdownEmpty}>{t('catalog.empty')}</div>
          )}
        </div>
      )}
    </div>
  );

  const handleGoToCatalog = () => router.push('/catalog');

  const isStructuredResult = (r: any): r is ComparisonResult =>
    r && typeof r === 'object' && Array.isArray(r.criteria);

  return (
    <div className={styles.body}>
      <Breadcrumb items={[
        { label: t('productPageContent.breadcrumb.home'), href: '/' },
        { label: t('compare.title') },
      ]} />

      <h1 className={styles.title}>{t('compare.title')}</h1>
      <p className={styles.subtitle}>{t('compare.subtitle')}</p>

      {categories.length > 0 && (
        <div className={styles.categoryFilter}>
          <span className={styles.categoryFilterLabel}>{t('compare.categoryFilter')}</span>
          <div className={styles.categoryTabs}>
            {categories.map((c) => (
              <button
                key={c.uuid}
                className={`${styles.categoryTab} ${activeCategoryUuid === c.uuid ? styles.categoryTabActive : ''}`}
                onClick={() => setActiveCategoryUuid(c.uuid)}
              >
                {c.label} ({c.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {displayedProducts.length === 0 ? (
        <div className={styles.emptyState}>
          <ScaleIcon size={48} />
          <p className={styles.emptyTitle}>{t('compare.empty')}</p>
          <p className={styles.emptyHint}>{t('compare.emptyHint')}</p>
          <button className={styles.searchCatalogBtn} onClick={handleGoToCatalog}>
            {t('compare.searchProducts')}
          </button>
        </div>
      ) : (
        <>
          <div className={styles.toolbar}>
            {searchBox}
            <div className={styles.toolbarActions}>
              <label className={styles.diffToggle}>
                <input type="checkbox" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} />
                {t('compare.diffOnly')}
              </label>
              <button className={styles.toolbarBtn} onClick={handleShare}>
                {t('compare.share')}
              </button>
              <button className={styles.toolbarBtnDanger} onClick={clearCompare}>
                {t('compare.clearAll')}
              </button>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <tbody>
                <tr className={styles.stickyRow}>
                  <td className={styles.rowLabel}>{t('compare.models')}</td>
                  {slots.map((p, i) => {
                    if (!p) return <td key={`empty-${i}`} className={styles.productCell}><div className={styles.placeholderBox} /></td>;
                    const imgSrc = p.images?.length
                      ? baseUrl + (p.images[0].image?.startsWith('/') ? p.images[0].image : '/' + p.images[0].image)
                      : '';
                    return (
                      <td key={p.uuid} className={styles.productCell}>
                        <button
                          className={styles.removeBtn}
                          onClick={() => removeFromCompare(p.uuid as any)}
                          aria-label="remove"
                        >
                          ✕
                        </button>
                        {imgSrc && (
                          <img
                            src={imgSrc}
                            alt={getLoc(p.name, locale)}
                            className={styles.productImg}
                            onClick={() => router.push(buildCatalogUrl(p))}
                          />
                        )}
                        <button
                          className={styles.cartBtn}
                          onClick={() => addToCart(p)}
                          aria-label="add to cart"
                        >
                          <CartIcon />
                        </button>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className={styles.rowLabel}>{t('compare.models')}</td>
                  {slots.map((p, i) => (
                    <td key={p?.uuid || `empty-${i}`} className={styles.productName}>
                      {p ? getLoc(p.name, locale) : ''}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className={styles.rowLabel}>{t('compare.price')}</td>
                  {slots.map((p, i) => (
                    <td key={p?.uuid || `empty-${i}`} className={styles.productPrice}>
                      {p ? formatPrice(p.price) : ''}
                    </td>
                  ))}
                </tr>

                {specGroups.map(({ groupKey, groupLabel, rows }) => {
                  const visibleRows = diffOnly ? rows.filter(([rowKey]) => isRowDifferent(groupKey, rowKey)) : rows;
                  if (visibleRows.length === 0) return null;
                  return (
                    <React.Fragment key={groupKey}>
                      <tr>
                        <td className={styles.groupHeader} colSpan={MAX_SLOTS + 1}>
                          {groupLabel}
                        </td>
                      </tr>
                      {visibleRows.map(([rowKey, rowLabel]) => {
                        const bestUuid = getBestUuid(groupKey, rowKey);
                        return (
                          <tr key={rowKey}>
                            <td className={styles.rowLabel}>{rowLabel}</td>
                            {slots.map((p, i) => (
                              <td
                                key={p?.uuid || `empty-${i}`}
                                className={`${styles.specValue} ${p && bestUuid === p.uuid ? styles.specValueBest : ''}`}
                              >
                                {p ? getSpecValue(p, groupKey, rowKey) : ''}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Мобильная раскладка: товары друг под другом, без горизонтального скролла */}
          <div
            className={[
              styles.mobileList,
              styles[`mobileListCols${displayedProducts.length}`],
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {displayedProducts.map((p) => {
              const imgSrc = p.images?.length
                ? baseUrl + (p.images[0].image?.startsWith('/') ? p.images[0].image : '/' + p.images[0].image)
                : '';
              return (
                <div key={p.uuid} className={styles.mobileCard}>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCompare(p.uuid as any)}
                    aria-label="remove"
                  >
                    ✕
                  </button>

                  <div className={styles.mobileHeader}>
                    {imgSrc && (
                      <img
                        src={imgSrc}
                        alt={getLoc(p.name, locale)}
                        className={styles.mobileImg}
                        onClick={() => router.push(buildCatalogUrl(p))}
                      />
                    )}
                    <div className={styles.mobileHeaderInfo}>
                      <p className={styles.mobileName}>{getLoc(p.name, locale)}</p>
                      <p className={styles.mobilePrice}>{formatPrice(p.price)}</p>
                      <button
                        className={styles.mobileCartBtn}
                        onClick={() => addToCart(p)}
                        aria-label={t('compare.addToCart')}
                      >
                        <CartIcon />
                      </button>
                    </div>
                  </div>

                  {specGroups.map(({ groupKey, groupLabel, rows }) => {
                    // Показываем ВСЕ строки группы (даже пустые для этого товара),
                    // чтобы строки совпадали между всеми карточками — товары встают
                    // на одну линию. Пустое значение помечаем прочерком.
                    const visibleRows = diffOnly
                      ? rows.filter(([rowKey]) => isRowDifferent(groupKey, rowKey))
                      : rows;
                    if (visibleRows.length === 0) return null;
                    return (
                      <div key={groupKey} className={styles.mobileGroup}>
                        <p className={styles.mobileGroupTitle}>{groupLabel}</p>
                        {visibleRows.map(([rowKey, rowLabel]) => {
                          const value = getSpecValue(p, groupKey, rowKey);
                          const isBest = getBestUuid(groupKey, rowKey) === p.uuid;
                          return (
                            <div key={rowKey} className={styles.mobileRow}>
                              <span className={styles.mobileRowLabel}>{rowLabel}</span>
                              <span className={`${styles.mobileRowValue} ${isBest ? styles.specValueBest : ''}`}>
                                {value || '—'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Smart Recommendations: гость → замок с входом, залогинен → заголовок (логика позже) */}
          <div className={styles.recommendations}>
            {!isAuth ? (
              <div className={styles.recLock}>
                <span className={styles.recLockIcon}>
                  <Lock size={22} strokeWidth={1.75} />
                </span>
                <p className={styles.recLockTitle}>{t('compare.recommendations.lock.title')}</p>
                <p className={styles.recLockSubtitle}>{t('compare.recommendations.lock.subtitle')}</p>
                <div className={styles.recLockActions}>
                  <button className={styles.recLockLoginBtn} onClick={() => router.push('/security/login?redirect=/compare')}>
                    {t('compare.recommendations.lock.login')}
                  </button>
                  <button className={styles.recLockRegisterBtn} onClick={() => router.push('/security/login?mode=register&redirect=/compare')}>
                    {t('compare.recommendations.lock.createAccount')}
                  </button>
                </div>
              </div>
            ) : compareUuids.length < 2 ? (
              <div className={styles.recommendationsHeader}>
                <Sparkles size={20} strokeWidth={1.75} />
                <p className={styles.recommendationsTitle}>{t('compare.recommendations.needTwo')}</p>
              </div>
            ) : (
              <div className={styles.recommendationsResult}>
                <div className={styles.recommendationsHeader}>
                  <Sparkles size={20} strokeWidth={1.75} className={aiFetching ? styles.recSpin : ''} />
                  <h2 className={styles.recommendationsTitle}>{t('compare.recommendations.title')}</h2>
                </div>
                {aiLoading ? (
                  <p className={styles.recommendationsText}>{t('compare.recommendations.loading')}</p>
                ) : isStructuredResult(aiComparison?.response) ? (
                  <div className={styles.aiComparisonResult}>
                    <div className={styles.aiCardsContainer}>
                      {aiComparison!.response.criteria.map((criterion, idx) => {

                        return (
                          <div
                            key={idx}
                            className={styles.aiRecommendationCard}
                          >
                            <div className={styles.aiCardNumber}>
                              {idx + 1}
                            </div>

                            <h3 className={styles.aiCardTitle}>
                              {pickLoc(criterion.title, locale)}
                            </h3>

                            <p className={styles.aiCardText}>
                              {pickLoc(criterion.explanation, locale)}
                            </p>

                            {criterion.values?.length > 0 && (
                              <div className={styles.aiValues}>
                                {criterion.values.map((value, i) => (
                                  <span
                                    key={i}
                                    className={styles.aiValue}
                                  >
                                    {pickLoc(value, locale)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className={styles.recommendationsText}>{aiComparison?.response as string}</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(ComparePage), { ssr: false });