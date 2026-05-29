'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CatalogItem } from '@homeberris/types/catalog';

type FavoritesState = {
  items: CatalogItem[];
  isFavorite: (uuid: string) => boolean;
  toggleFavorite: (item: CatalogItem) => void;
};

const FavoritesContext = createContext<FavoritesState | undefined>(undefined);

const STORAGE_KEY = 'hb_favorites';

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        setItems(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, loaded]);

  const isFavorite = (uuid: string) => items.some((i) => i.uuid === uuid);

  const toggleFavorite = (item: CatalogItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.uuid === item.uuid);
      if (exists) {
        return prev.filter((i) => i.uuid !== item.uuid);
      }
      return [...prev, item];
    });
  };

  return (
    <FavoritesContext.Provider value={{ items, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return ctx;
};

