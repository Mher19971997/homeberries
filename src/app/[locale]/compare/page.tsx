'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';

import { useCompare } from '@homeberris/context/compareContext';
import { getCatalogByUud } from '@homeberris/http/catalogApi';
import { insertBasket } from '@homeberris/http/basketApi';
import { addToBasket } from '@homeberris/utils/indexedDB';
import { checkToken, getToken } from '@homeberris/utils/auth';
import { useFormatPrice } from '@homeberris/utils/formatPrice';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import Breadcrumb from '@homeberris/components/Breadcrumb';
import { ScaleIcon } from '@homeberris/assets/icons/compare';
import { CatalogItem } from '@homeberris/types/catalog';
import styles from './index.module.css';
import { CartIcon } from '@homeberris/assets/icons/navbar';

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

function ComparePage() {
  const { t } = useTranslation('common');
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) ?? 'ru';
  const [cookies] = useCookies(['token']);
  const queryClient = useQueryClient();
  const { formatPrice } = useFormatPrice();
  const { items, removeFromCompare } = useCompare();
  const isAuth = checkToken();

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

    products.forEach((p) => {
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
        products.flatMap((p: any) => p.groupOption || []).find((g: any) =>
          (typeof g.name === 'string' ? g.name : g.name?.ru) === groupKey
        )?.name,
        locale,
      ),
      rows: Array.from(groupRows.get(groupKey)!.entries()),
    }));
  }, [products, locale]);

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

  if (items.length === 0) {
    return (
      <div className={styles.body}>
        <Breadcrumb items={[
          { label: t('productPageContent.breadcrumb.home'), href: '/' },
          { label: t('compare.title') },
        ]} />
        <div className={styles.emptyState}>
          <ScaleIcon size={48} />
          <p className={styles.emptyTitle}>{t('compare.empty')}</p>
          <p className={styles.emptyHint}>{t('compare.emptyHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.body}>
      <Breadcrumb items={[
        { label: t('productPageContent.breadcrumb.home'), href: '/' },
        { label: t('compare.title') },
      ]} />

      <h1 className={styles.title}>{t('compare.title')}</h1>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td className={styles.rowLabel}>{t('compare.models')}</td>
              {products.map((p) => {
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
                      <CartIcon/>
                    </button>
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className={styles.rowLabel}>{t('compare.models')}</td>
              {products.map((p) => (
                <td key={p.uuid} className={styles.productName}>
                  {getLoc(p.name, locale)}
                </td>
              ))}
            </tr>

            <tr>
              <td className={styles.rowLabel}>{t('compare.price')}</td>
              {products.map((p) => (
                <td key={p.uuid} className={styles.productPrice}>
                  {formatPrice(p.price)}
                </td>
              ))}
            </tr>

            {specGroups.map(({ groupKey, groupLabel, rows }) => (
              <React.Fragment key={groupKey}>
                <tr>
                  <td className={styles.groupHeader} colSpan={products.length + 1}>
                    {groupLabel}
                  </td>
                </tr>
                {rows.map(([rowKey, rowLabel]) => (
                  <tr key={rowKey}>
                    <td className={styles.rowLabel}>{rowLabel}</td>
                    {products.map((p) => (
                      <td key={p.uuid} className={styles.specValue}>
                        {getSpecValue(p, groupKey, rowKey)}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(ComparePage), { ssr: false });
