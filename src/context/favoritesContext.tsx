'use client';
import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { CatalogItem } from '@homeberris/types/catalog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCookies } from 'react-cookie';
import { checkToken, getToken } from '@homeberris/utils/auth';
import { getAllFavorites, toggleFavorite as toggleFavoriteApi } from '@homeberris/http/favoritesApi';

const LOCAL_KEY = 'hb_favorites';

type FavoritesState = {
  items: CatalogItem[];
  isLoading: boolean;
  isFavorite: (uuid: string) => boolean;
  toggleFavorite: (item: CatalogItem) => void;
};

const FavoritesContext = createContext<FavoritesState | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [cookies] = useCookies(['token']);
  const isAuth = checkToken();
  const token = getToken() || cookies.token;

  // ── локальный стейт для неавторизованных ──
  const [localItems, setLocalItems] = useState<CatalogItem[]>([]);
  const [localLoaded, setLocalLoaded] = useState(false);

  useEffect(() => {
    if (isAuth) return; // авторизован — не нужен localStorage
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) setLocalItems(JSON.parse(raw));
    } catch { }
    setLocalLoaded(true);
  }, [isAuth]);

  useEffect(() => {
    if (isAuth) return;
    if (!localLoaded) return;
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(localItems));
    } catch { }
  }, [localItems, localLoaded, isAuth]);

  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => getAllFavorites('', token),
    enabled: !!isAuth && !!token,
    staleTime: 1000 * 60 * 5,
  });

  const records = data?.data ?? [];
  const apiItems: CatalogItem[] = records.map((r: any) => r.catalog).filter(Boolean);

  const mutation = useMutation({
    mutationFn: (catalogUuid: string) => toggleFavoriteApi(catalogUuid, token),
    onMutate: async (catalogUuid) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previous = queryClient.getQueryData(['favorites']);
      queryClient.setQueryData(['favorites'], (old: any) => {
        const rows = old?.data ?? [];
        const exists = rows.some((r: any) => r.catalogUuid === catalogUuid);
        return {
          ...old,
          data: exists
            ? rows.filter((r: any) => r.catalogUuid !== catalogUuid)
            : [...rows, { catalogUuid, catalog: null }],
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['favorites'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  // ── общие функции ──
  const isFavorite = useCallback(
    (uuid: string) => {
      if (isAuth) return records.some((r: any) => r.catalogUuid === uuid);
      return localItems.some((i) => i.uuid === uuid);
    },
    [isAuth, records, localItems],
  );

  const toggleFavorite = useCallback(
    (item: CatalogItem) => {
      if (isAuth && token) {
        // авторизован → API
        mutation.mutate(item.uuid);
      } else {
        // не авторизован → localStorage
        setLocalItems((prev) => {
          const exists = prev.some((i) => i.uuid === item.uuid);
          return exists ? prev.filter((i) => i.uuid !== item.uuid) : [...prev, item];
        });
      }
    },
    [isAuth, token, mutation],
  );

  const items = isAuth ? apiItems : localItems;

  return (
    <FavoritesContext.Provider value={{ items, isLoading: isAuth ? isLoading : false, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};





// 'use client';
// import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { CatalogItem } from '@homeberris/types/catalog';

// type FavoritesState = {
//   items: CatalogItem[];
//   isFavorite: (uuid: string) => boolean;
//   toggleFavorite: (item: CatalogItem) => void;
// };

// const FavoritesContext = createContext<FavoritesState | undefined>(undefined);

// const STORAGE_KEY = 'hb_favorites';

// export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [items, setItems] = useState<CatalogItem[]>([]);
//   const [loaded, setLoaded] = useState(false);

//   useEffect(() => {
//     try {
//       const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
//       if (raw) {
//         setItems(JSON.parse(raw));
//       }
//     } catch {
//       // ignore
//     }
//     setLoaded(true);
//   }, []);

//   useEffect(() => {
//     if (typeof window === 'undefined') return;
//     if (!loaded) return;
//     try {
//       window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
//     } catch {
//       // ignore
//     }
//   }, [items, loaded]);

//   const isFavorite = (uuid: string) => items.some((i) => i.uuid === uuid);

//   const toggleFavorite = (item: CatalogItem) => {
//     setItems((prev) => {
//       const exists = prev.some((i) => i.uuid === item.uuid);
//       if (exists) {
//         return prev.filter((i) => i.uuid !== item.uuid);
//       }
//       return [...prev, item];
//     });
//   };

//   return (
//     <FavoritesContext.Provider value={{ items, isFavorite, toggleFavorite }}>
//       {children}
//     </FavoritesContext.Provider>
//   );
// };

// export const useFavorites = () => {
//   const ctx = useContext(FavoritesContext);
//   if (!ctx) {
//     throw new Error('useFavorites must be used within FavoritesProvider');
//   }
//   return ctx;
// };

