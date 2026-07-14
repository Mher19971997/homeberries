"use client";

import { useLocalizedRouter as useRouter } from "@homeberris/hooks/useLocalizedRouter";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import styles from "./index.module.css";
import { useTranslation } from "react-i18next";
import { getActiveSeasonalBanners } from "@homeberris/http/seasonalBannerApi";

const getLoc = (val: any, locale: string): string => {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[locale] || val.ru || "";
};

export default function BigSummerSale() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "ru";

  const { data: banners = [] } = useQuery({
    queryKey: ["activeSeasonalBanners"],
    queryFn: getActiveSeasonalBanners,
  });

  if (!banners.length) return null;

  return (
    <div className={styles.carouselWrapper}>
      <Swiper
        modules={[Pagination]}
        pagination={
          banners.length > 1
            ? {
                clickable: true,
                bulletActiveClass: styles.activeDot,
                bulletClass: styles.dot,
              }
            : false
        }
        grabCursor
        slidesPerView={1}
        className={styles.carouselTrack}
      >
        {banners.map((banner) => {
          const fullTitle = getLoc(banner.title, locale);
          const titleWords = fullTitle.split(" ");
          const titleThin = titleWords.slice(0, -1).join(" ");
          const titleBold = titleWords.slice(-1)[0];
          const description = getLoc(banner.subtitle, locale);
          const buttonText =
            getLoc(banner.buttonText, locale) || t("home.shopNow");
          const buttonLink = banner.buttonLink || "/catalog";

          return (
            <SwiperSlide key={banner.uuid} className={styles.saleBanner}>
              <div className={styles.overlayContent}>
                <h2 className={styles.mainTitle}>
                  {titleThin && (
                    <span className={styles.thinText}>{titleThin}&nbsp;</span>
                  )}
                  <span className={styles.boldText}>{titleBold}</span>
                </h2>

                {description && (
                  <p className={styles.subtitle}>{description}</p>
                )}

                <button
                  className={styles.shopButton}
                  onClick={() => router.push(buttonLink)}
                >
                  {buttonText}
                </button>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
