"use client";

import { useState, useRef, useEffect } from "react";
import { useLocalizedRouter as useRouter } from "@homeberris/hooks/useLocalizedRouter";
import {
  PaginationLeft,
  PaginationRight,
} from "@homeberris/assets/icons/catalog";
import * as qs from "qs";
import { getAllCatalogs } from "@homeberris/http/catalogApi";
import styles from "@homeberris/app/[locale]/index.module.css";
import { CatalogItem } from "@homeberris/types/catalog";
import CarouselCatalog from "@homeberris/components/CarouselCatalog";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CategoryItem, SubCategoryItem } from "@homeberris/types/category";
import { useTranslation } from "react-i18next";
import SmallerBanners from "@homeberris/components/SmallerBanners";
import BrowseByCategory from "@homeberris/components/BrowseByCategory";
import ProductGridBanners from "@homeberris/components/ProductGridBanners";
import CatalogCard from "@homeberris/components/CatalogCard";
import BigSummerSale from "@homeberris/components/BigSummerSale";
import Spinner from "@homeberris/components/Spinner";

const DISCOUNT_LIMIT = 4;

import paginationStyles from "@homeberris/app/[locale]/catalog/[category]/index.module.css";

const renderPagination = (
  currentPage: number,
  totalPages: number,
  setPage: (p: number) => void,
) => {
  if (totalPages <= 1) return null;
  const pages: (number | string)[] = [];
  if (totalPages <= 4) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end =
      currentPage <= 2
        ? Math.min(totalPages - 1, 3)
        : Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }
  return (
    <div className={paginationStyles.pagination}>
      <button
        className={paginationStyles.pageBtn}
        onClick={() => setPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <PaginationLeft />
      </button>
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className={paginationStyles.pageDots}>
            ...
          </span>
        ) : (
          <button
            key={page}
            className={`${paginationStyles.pageBtn} ${currentPage === page ? paginationStyles.pageBtnActive : ""}`}
            onClick={() => setPage(page as number)}
          >
            {page}
          </button>
        ),
      )}
      <button
        className={paginationStyles.pageBtn}
        onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <PaginationRight />
      </button>
    </div>
  );
};

const getLoc = (val: any, locale: string) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[locale] || val.ru || val.en || "";
};

const buildCatalogUrl = (catalog: CatalogItem, locale: string) => {
  const cat = getLoc((catalog as any).category?.name, "en");
  const sub = getLoc((catalog as any).subCategorie?.name, "en");
  const uuid = catalog.uuid;
  if (cat && sub)
    return `/catalog/${encodeURIComponent(cat)}/${encodeURIComponent(sub)}/${uuid}`;
  if (cat) return `/catalog/${encodeURIComponent(cat)}/${uuid}`;
  return `/catalog`;
};

export default function Home() {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language || "ru";
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(
    null,
  );
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategoryItem | null>(null);

  const [activeTab, setActiveTab] = useState<"new" | "bestseller" | "featured">(
    "new",
  );
  const [newPage, setNewPage] = useState(1);
  const [discountPage, setDiscountPage] = useState(1);
  const catalogGridRef = useRef<HTMLDivElement>(null);
  const discountGridRef = useRef<HTMLDivElement>(null);
  const [catalogMinHeight, setCatalogMinHeight] = useState<number>(0);
  const [discountMinHeight, setDiscountMinHeight] = useState<number>(0);

  // На ширинах с 3 колонками (600px–1280px) 8 не делится нацело на 3 и оставляет
  // неполный последний ряд — запрашиваем 6 товаров вместо 8, чтобы ряды были полными.
  const [itemsLimit, setItemsLimit] = useState(8);

  useEffect(() => {
    const updateItemsLimit = () => {
      const w = window.innerWidth;
      setItemsLimit(w > 599 && w <= 1280 ? 6 : 8);
    };
    updateItemsLimit();
    window.addEventListener("resize", updateItemsLimit);
    return () => window.removeEventListener("resize", updateItemsLimit);
  }, []);

  useEffect(() => {
    setNewPage(1);
  }, [itemsLimit]);

  const buildQuery = () => {
    const filters: any = {
      queryMeta: {
        paginate: true,
        limit: itemsLimit,
        page: newPage,
        order: {
          createdAt: "DESC",
        },
      },
    };

    if (activeTab === "featured") {
      filters.filterMeta = { isFeatured: true, isActive: true };
    } else {
      filters.filterMeta = { isActive: true };
    }

    if (selectedCategory) {
      filters.includeMeta = [
        { association: "category", where: { uuid: selectedCategory.uuid } },
      ];
    }

    if (selectedSubCategory) {
      if (!filters.includeMeta) filters.includeMeta = [];
      filters.includeMeta.push({
        association: "subCategorie",
        where: { uuid: selectedSubCategory.uuid },
      });
    }

    return qs.stringify(filters);
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "getAllCatalogs",
      selectedCategory?.uuid,
      selectedSubCategory?.uuid,
      newPage,
      activeTab,
      itemsLimit,
    ],
    queryFn: () => getAllCatalogs(buildQuery()),
    placeholderData: keepPreviousData,
  });

  const {
    data: discountData,
    isLoading: isDiscountLoading,
    isFetching: isDiscountFetching,
  } = useQuery({
    queryKey: ["getDiscountCatalogs", discountPage],
    queryFn: () =>
      getAllCatalogs(
        qs.stringify({
          filterMeta: { isDiscount: true },
          queryMeta: {
            paginate: true,
            limit: DISCOUNT_LIMIT,
            page: discountPage,
            order: {
              createdAt: "DESC",
            },
          },
        }),
      ),
    placeholderData: keepPreviousData,
  });

  const catalogs: CatalogItem[] = data?.data || [];
  const discountCatalogs: CatalogItem[] = discountData?.data || [];
  const newTotalPages = data?.meta
    ? Math.max(1, Math.ceil(data.meta.count / itemsLimit))
    : 1;

  useEffect(() => {
    if (!isLoading && catalogGridRef.current) {
      setCatalogMinHeight(catalogGridRef.current.offsetHeight);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isDiscountLoading && discountGridRef.current) {
      setDiscountMinHeight(discountGridRef.current.offsetHeight);
    }
  }, [isDiscountLoading]);
  const discountTotalPages = discountData?.meta
    ? Math.max(1, Math.ceil(discountData.meta.count / DISCOUNT_LIMIT))
    : 1;

  return (
    <div className={styles.body}>
      <CarouselCatalog />
      <SmallerBanners />
      <BrowseByCategory />
      <div className={styles.parentTabItem}>
        <span
          onClick={() => {
            setActiveTab("new");
            setNewPage(1);
          }}
          className={styles.tabItem}
          style={{
            cursor: "pointer",
            color: activeTab === "new" ? "#000000" : "#8b8b8b",
            borderBottom:
              activeTab === "new"
                ? "2px solid #000000"
                : "2px solid transparent",
          }}
        >
          {t("home.tabs.new")}
        </span>
        <span
          onClick={() => {
            setActiveTab("bestseller");
            setNewPage(1);
          }}
          className={styles.tabItem}
          style={{
            cursor: "pointer",
            color: activeTab === "bestseller" ? "#000000" : "#8b8b8b",
            borderBottom:
              activeTab === "bestseller"
                ? "2px solid #000000"
                : "2px solid transparent",
          }}
        >
          {t("home.tabs.bestseller")}
        </span>
        <span
          onClick={() => {
            setActiveTab("featured");
            setNewPage(1);
          }}
          className={styles.tabItem}
          style={{
            cursor: "pointer",
            color: activeTab === "featured" ? "#000000" : "#8b8b8b",
            borderBottom:
              activeTab === "featured"
                ? "2px solid #000000"
                : "2px solid transparent",
          }}
        >
          {t("home.tabs.featured")}
        </span>
      </div>

      <div
        ref={catalogGridRef}
        style={{
          position: "relative",
          minHeight: isLoading ? catalogMinHeight : undefined,
        }}
      >
        {isLoading && <Spinner overlay />}
        {!isLoading && isFetching && <Spinner overlay />}
        <div className={styles.catalogWrapper}>
          <div className={styles.catalogGrid}>
            {catalogs.length > 0 ? (
              catalogs.map((catalog, index) => (
                <div
                  className={styles.catalogItem}
                  key={catalog?.uuid || index}
                >
                  <CatalogCard
                    catalog={catalog}
                    onNavigate={() =>
                      router.push(buildCatalogUrl(catalog, locale))
                    }
                  />
                </div>
              ))
            ) : (
              <div style={{ padding: "32px", width: "100%" }}>
                <p style={{ textAlign: "center" }}>{t("catalog.empty")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {renderPagination(newPage, newTotalPages, setNewPage)}
      <ProductGridBanners />
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "80px auto 80px auto",
          padding: "0 16px",
        }}
      >
        <p
          style={{
            fontSize: "24px",
            fontWeight: 500,
            color: "#000000",
            marginBottom: "32px",
            fontFamily: "var(--font-inter)",
            textAlign: "left",
          }}
        >
          {t("home.discountsTitle")}
        </p>

        <div
          ref={discountGridRef}
          style={{
            position: "relative",
            minHeight: isDiscountLoading ? discountMinHeight : undefined,
          }}
        >
          {isDiscountLoading && <Spinner overlay />}
          {!isDiscountLoading && isDiscountFetching && <Spinner overlay />}
          <div className={styles.catalogGrid}>
            {discountCatalogs.length > 0 ? (
              discountCatalogs.map((catalog, index) => (
                <div
                  className={styles.catalogItem}
                  key={`discount-${catalog?.uuid || index}`}
                >
                  <CatalogCard
                    catalog={catalog}
                    onNavigate={() =>
                      router.push(buildCatalogUrl(catalog, locale))
                    }
                  />
                </div>
              ))
            ) : (
              <div style={{ padding: "32px", width: "100%" }}>
                <p style={{ textAlign: "center" }}>{t("catalog.empty")}</p>
              </div>
            )}
          </div>
        </div>
        {renderPagination(discountPage, discountTotalPages, setDiscountPage)}
      </div>
      <BigSummerSale />
    </div>
  );
}
