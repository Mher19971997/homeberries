"use client";
import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { CatalogItem } from "@homeberris/types/catalog";
import { useTranslation } from "react-i18next";
import CompareLimitSnackbar from "@homeberris/components/CompareLimitSnackbar";

const LOCAL_KEY = "hb_compare";
const MAX_ITEMS = 4;

type CompareState = {
  items: CatalogItem[];
  isInCompare: (uuid: string) => boolean;
  toggleCompare: (item: CatalogItem) => void;
  removeFromCompare: (uuid: string) => void;
  clearCompare: () => void;
  loadFromShare: (uuids: string[]) => void;
};

const CompareContext = createContext<CompareState | undefined>(undefined);

export const CompareProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { t } = useTranslation("common");

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [limitToastOpen, setLimitToastOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  const isInCompare = useCallback(
    (uuid: string) => items.some((i) => i.uuid === uuid),
    [items],
  );

  const toggleCompare = useCallback((item: CatalogItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.uuid === item.uuid);
      if (exists) {
        return prev.filter((i) => i.uuid !== item.uuid);
      }

      const itemCategoryUuid =
        item.category?.uuid || (item as any).categoryUuid;
      const sameCategoryCount = prev.filter((i) => {
        const prevCategoryUuid = i.category?.uuid || (i as any).categoryUuid;
        return prevCategoryUuid === itemCategoryUuid;
      }).length;

      if (sameCategoryCount >= MAX_ITEMS) {
        setLimitToastOpen(true);
        return prev;
      }

      return [item, ...prev];
    });
  }, []);

  const removeFromCompare = useCallback((uuid: string) => {
    setItems((prev) => prev.filter((i) => i.uuid !== uuid));
  }, []);

  const clearCompare = useCallback(() => setItems([]), []);

  const loadFromShare = useCallback((uuids: string[]) => {
    setItems(
      uuids.slice(0, MAX_ITEMS).map((uuid) => ({ uuid }) as CatalogItem),
    );
  }, []);

  return (
    <CompareContext.Provider
      value={{
        items,
        isInCompare,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        loadFromShare,
      }}
    >
      {children}

      <CompareLimitSnackbar
        open={limitToastOpen}
        message={t("compare.maxItems")}
        handleClose={() => setLimitToastOpen(false)}
      />
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
};