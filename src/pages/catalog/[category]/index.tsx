import React from "react";
import * as qs from "qs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronSepIcon, PaginationLeft, PaginationRight, filteration as FilterIcon } from "@homeberris/assets/icons/catalog";
import { useParams } from "next/navigation";

import { getAllCatalogs } from "@homeberris/http/catalogApi";
import { getMenuTree } from "@homeberris/http/categoryApi";
import { getBrandsByCategory } from "@homeberris/http/brandApi";
import { CatalogItem } from "@homeberris/types/catalog";
import { CategoryItem } from "@homeberris/types/category";

import SidebarFilters from "@homeberris/components/SidebarFilters";
import StaticProductCard from "@homeberris/components/StaticProductCard";
import MobileFilterDrawer from "@homeberris/components/MobileFilterDrawer";

import { useQuery } from "@tanstack/react-query";
import { ListResult } from "@homeberris/types/filter";

import styles from "@homeberris/pages/catalog/[category]/index.module.css";

const ITEMS_PER_PAGE = 9;

export default function CatalogPage() {
  const router = useRouter();
  const params = useParams();
  const category = params?.category;
  const categoryName =
    typeof category === "string" ? decodeURIComponent(category) : "";
  const breadcrumbPath = categoryName
    ? `/catalog/${encodeURIComponent(categoryName)}`
    : "/catalog";

  const [showDrawer, setShowDrawer] = React.useState(false);
  const [sortBy, setSortBy] = React.useState("rating");
  const [priceRange, setPriceRange] = React.useState<{
    min: number;
    max: number;
  } | null>(null);
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([]);
  const [groupFilters, setGroupFilters] = React.useState<Record<string, string[]>>({});
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, priceRange, selectedBrands, groupFilters]);

  const { data: menuTree } = useQuery({
    queryKey: ["getMenuTree"],
    queryFn: getMenuTree,
  });
  const categoryData = (menuTree || []).find(
    (c: CategoryItem) => c.name === categoryName,
  );
  const categoryUuid = categoryData?.uuid;

  const { data: brandsData } = useQuery({
    queryKey: ["getBrandsByCategory", categoryUuid],
    queryFn: () => getBrandsByCategory(categoryUuid || ""),
    enabled: !!categoryUuid,
  });
  const brands = brandsData?.data || [];

  const buildQuery = () => {
    const filters: any = {
      includeMeta: [
        { association: "category", where: { name: categoryName } },
        { association: "brand" },
        { association: "groupOption", include: [{ association: "options" }] },
        ...Object.entries(groupFilters).map(([groupName, values]) => ({
          association: "groupOption",
          where: { name: groupName },
          include: [{ association: "options", where: { value: { in: values } } }],
        })),
      ],
      queryMeta: { paginate: true, limit: ITEMS_PER_PAGE, page: currentPage },
    };
    if (priceRange)
      filters.where = { price: { $gte: priceRange.min, $lte: priceRange.max } };
    if (selectedBrands.length > 0)
      filters.filterMeta = { brandUuid: { in: selectedBrands } };
    if (sortBy === "price_asc") filters.queryMeta.order = { price: "ASC" };
    else if (sortBy === "price_desc") filters.queryMeta.order = { price: "DESC" };
    else if (sortBy === "rating") filters.queryMeta.order = { rating: "DESC" };
    else if (sortBy === "newest") filters.queryMeta.order = { createdAt: "DESC" };
    return qs.stringify(filters);
  };

  const { data: catalogs } = useQuery<{
    data: CatalogItem[];
    meta: ListResult;
  }>({
    queryKey: [
      "getAllCatalogsByCategory",
      categoryName,
      sortBy,
      priceRange,
      selectedBrands,
      groupFilters,
      currentPage,
    ],
    queryFn: () => getAllCatalogs(buildQuery()),
    enabled: !!categoryName,
  });

  const totalPages = catalogs?.meta
    ? Math.max(1, Math.ceil(catalogs.meta.count / ITEMS_PER_PAGE))
    : 0;

  return (
    <div className={styles.body}>
      <MobileFilterDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        brands={brands}
        selectedBrands={selectedBrands}
        priceRange={priceRange}
        onApply={(brands, price) => {
          setSelectedBrands(brands);
          setPriceRange(price);
        }}
      />
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="breadcrumb">
        <Link href="/" className={styles.breadcrumbLink}>
          Главная
        </Link>
        <ChevronSepIcon className={styles.breadcrumbSep} />
        <Link href="/catalog" className={styles.breadcrumbLink}>
          Catalog
        </Link>
        <ChevronSepIcon className={styles.breadcrumbSep} />
        <Link
          href={breadcrumbPath}
          className={`${styles.breadcrumbLink} ${styles.breadcrumbLinkActive}`}
        >
          {categoryName}
        </Link>
      </nav>

      {/* Layout */}
      <div className={styles.pageLayout}>
        {/* Левый сайдбар */}
        <div className={styles.sidebar}>
          <SidebarFilters
            brands={brands}
            selectedBrands={selectedBrands}
            onBrandsChange={setSelectedBrands}
            categoryName={categoryName}
            catalogs={catalogs?.data || []}
            onFiltersChange={setGroupFilters}
          />
        </div>

        {/* Правая часть */}
        <div className={styles.content}>
          {/* Шапка */}
          <div className={styles.contentHeader}>
            <button
              className={styles.filterToggleBtn}
              onClick={() => setShowDrawer(true)}
            >
              <FilterIcon />
              Filters
            </button>
            <p className={styles.selectedCount}>
              Selected Products: <strong>{catalogs?.meta?.count || 0}</strong>
            </p>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating">By rating</option>
              <option value="popularity">By popularity</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Грид товаров */}
          <div className={styles.productTotal}>
            <p>Products Result : <span>85</span></p>
          </div>
          <StaticProductCard
            catalogs={catalogs?.data || []}
            onNavigate={(item) => {
              const cat = (item as any).category?.name || categoryName;
              const sub = (item as any).subCategorie?.name;
              const url = sub
                ? `/catalog/${encodeURIComponent(cat)}/${encodeURIComponent(sub)}/${item.uuid}`
                : `/catalog/${encodeURIComponent(cat)}/${item.uuid}`;
              router.push(url);
            }}
          />

          {/* Пагинация */}
          {totalPages >= 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <PaginationLeft />
              </button>

              {(() => {
                const pages: (number | string)[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (currentPage > 3) pages.push("...");
                  for (
                    let i = Math.max(2, currentPage - 1);
                    i <= Math.min(totalPages - 1, currentPage + 1);
                    i++
                  ) {
                    pages.push(i);
                  }
                  if (currentPage < totalPages - 2) pages.push("...");
                  pages.push(totalPages);
                }
                return pages.map((page, i) =>
                  page === "..." ? (
                    <span key={`dots-${i}`} className={styles.pageDots}>
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`}
                      onClick={() => setCurrentPage(page as number)}
                    >
                      {page}
                    </button>
                  ),
                );
              })()}

              <button
                className={styles.pageBtn}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <PaginationRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
