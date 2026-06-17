'use client';
import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { CatalogItem } from '@homeberris/types/catalog';
import { useToast } from '@homeberris/hooks/useToast';
import { useTranslation } from 'react-i18next';

const LOCAL_KEY = 'hb_compare';
const MAX_ITEMS = 4;

type CompareState = {
  items: CatalogItem[];
  isInCompare: (uuid: string) => boolean;
  toggleCompare: (item: CatalogItem) => void;
  removeFromCompare: (uuid: string) => void;
  clearCompare: () => void;
};

const CompareContext = createContext<CompareState | undefined>(undefined);

export const CompareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { t } = useTranslation('common');

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    } catch { }
  }, [items, loaded]);

  const isInCompare = useCallback(
    (uuid: string) => items.some((i) => i.uuid === uuid),
    [items],
  );

  const toggleCompare = useCallback(
    (item: CatalogItem) => {
      setItems((prev) => {
        const exists = prev.some((i) => i.uuid === item.uuid);
        if (exists) {
          return prev.filter((i) => i.uuid !== item.uuid);
        }

        const itemCategoryUuid = item.category?.uuid || item.categoryUuid;
        const conflictingCategory = prev.find((i) => {
          const prevCategoryUuid = i.category?.uuid || i.categoryUuid;
          return prevCategoryUuid && itemCategoryUuid && prevCategoryUuid !== itemCategoryUuid;
        });

        if (conflictingCategory) {
          showToast(t('compare.differentCategory'), 'warning');
          return prev;
        }

        if (prev.length >= MAX_ITEMS) {
          showToast(t('compare.maxItems'), 'warning');
          return prev;
        }

        return [...prev, item];
      });
    },
    [showToast, t],
  );

  const removeFromCompare = useCallback((uuid: string) => {
    setItems((prev) => prev.filter((i) => i.uuid !== uuid));
  }, []);

  const clearCompare = useCallback(() => setItems([]), []);

  return (
    <CompareContext.Provider value={{ items, isInCompare, toggleCompare, removeFromCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
};
