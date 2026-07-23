"use client";
import React from "react";
import { useLocalizedRouter as useRouter } from "@homeberris/hooks/useLocalizedRouter";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Inter } from "next/font/google";
import styles from "./index.module.css";
import { useTranslation } from "react-i18next";
import {
  getActiveSmallerBanners,
  SmallerBannerItem,
} from "@homeberris/http/smallerBannerApi";
import { LocalizedString } from "@homeberris/http/bannerApi";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700"],
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const DEFAULT_IMAGES = [
  "/images/PlayStation.png",
  "/images/AppleAirPodsMax.png",
  "/images/AppleVisionPro.png",
  "/images/MacBookPro14.png",
];
const DEFAULT_IMAGES_MOBILE = [
  "/images/PlayStationMobile.png",
  "/images/AppleAirPodsMaxMobile.png",
  "/images/AppleVisionProMobile.png",
  "/images/MacBookPro.png",
];

const getLoc = (val: LocalizedString | undefined, locale: string): string => {
  if (!val) return "";
  return val[locale as keyof LocalizedString] || val.ru || "";
};

const getImgSrc = (banner: SmallerBannerItem | undefined, fallback: string) => {
  if (!banner?.image) return fallback;
  return banner.image.startsWith("http")
    ? banner.image
    : `${BASE_URL}/${banner.image}`;
};

const SmallerBanners: React.FC = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "ru";

  const { data: banners = [] } = useQuery<SmallerBannerItem[]>({
    queryKey: ["activeSmallerBanners"],
    queryFn: getActiveSmallerBanners,
  });

  // порядок фиксирован sortOrder'ом на бэке: 0=PS5, 1=AirPods, 2=VisionPro, 3=MacBook
  const [ps5, airpods, visionPro, macbook] = banners;

  const ps5Btn = getLoc(ps5?.buttonText, locale);
  const airpodsBtn = getLoc(airpods?.buttonText, locale);
  const visionBtn = getLoc(visionPro?.buttonText, locale);
  const macbookBtn = getLoc(macbook?.buttonText, locale);

  return (
    <div
      className={`${styles.wrapper} ${inter.className}`}
      style={{ "--font-inter": inter.style.fontFamily } as React.CSSProperties}
    >
      <div className={styles.grid}>
        <div className={styles.leftCol}>
          {/* PlayStation 5 */}
          <div className={`${styles.card} ${styles.cardPS5}`}>
            <picture className={styles.imgPS5Container}>
              <source
                media="(max-width: 699px)"
                srcSet={getImgSrc(ps5, DEFAULT_IMAGES_MOBILE[0])}
              />
              <img
                className={styles.imgPS5}
                src={getImgSrc(ps5, DEFAULT_IMAGES[0])}
                alt={getLoc(ps5?.title, locale) || "Playstation 5"}
              />
            </picture>
            <div className={styles.cardTextPS5}>
              <h3 className={styles.titleLg}>
                {getLoc(ps5?.title, locale) || "Playstation 5"}
              </h3>
              <p className={styles.desc}>
                {getLoc(ps5?.subtitle, locale) || t("smallerBanners.ps5.desc")}
              </p>
              {ps5Btn && ps5?.buttonLink && (
                <button
                  className={styles.shopBtn}
                  onClick={() => router.push(ps5.buttonLink!)}
                >
                  {ps5Btn}
                </button>
              )}
            </div>
          </div>

          <div className={styles.bottomRow}>
            {/* AirPods Max */}
            <div className={`${styles.card} ${styles.cardAirpods}`}>
              <picture className={styles.imgAirpodsContainer}>
                <source
                  media="(max-width: 699px)"
                  srcSet={getImgSrc(airpods, DEFAULT_IMAGES_MOBILE[1])}
                />
                <img
                  className={styles.imgAirpods}
                  src={getImgSrc(airpods, DEFAULT_IMAGES[1])}
                  alt={getLoc(airpods?.title, locale) || "AirPods Max"}
                />
              </picture>
              <div className={styles.cardTextCenter}>
                {airpods?.title ? (
                  <h3 className={styles.titleSm}>
                    {getLoc(airpods.title, locale)}
                  </h3>
                ) : (
                  <h3 className={styles.titleSm}>
                    Apple <br className={styles.brDesktop} /> AirPods{" "}
                    <strong>Max</strong>
                  </h3>
                )}
                <p className={styles.desc}>
                  {getLoc(airpods?.subtitle, locale) ||
                    t("smallerBanners.airpods.desc")}
                </p>
                {airpodsBtn && airpods?.buttonLink && (
                  <button
                    className={styles.shopBtn}
                    onClick={() => router.push(airpods.buttonLink!)}
                  >
                    {airpodsBtn}
                  </button>
                )}
              </div>
            </div>

            {/* Vision Pro */}
            <div className={`${styles.card} ${styles.cardVision}`}>
              <picture className={styles.imgVisionContainer}>
                <source
                  media="(max-width: 699px)"
                  srcSet={getImgSrc(visionPro, DEFAULT_IMAGES_MOBILE[2])}
                />
                <img
                  className={styles.imgVision}
                  src={getImgSrc(visionPro, DEFAULT_IMAGES[2])}
                  alt={getLoc(visionPro?.title, locale) || "Vision Pro"}
                />
              </picture>
              <div className={styles.cardTextCenter}>
                {visionPro?.title ? (
                  <h3 className={styles.titleSmLight}>
                    {getLoc(visionPro.title, locale)}
                  </h3>
                ) : (
                  <h3 className={styles.titleSmLight}>
                    Apple <br className={styles.brDesktop} /> Vision{" "}
                    <strong>Pro</strong>
                  </h3>
                )}
                <p className={styles.desc}>
                  {getLoc(visionPro?.subtitle, locale) ||
                    t("smallerBanners.visionPro.desc")}
                </p>
                {visionBtn && visionPro?.buttonLink && (
                  <button
                    className={styles.shopBtn}
                    onClick={() => router.push(visionPro.buttonLink!)}
                  >
                    {visionBtn}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MacBook Air */}
        <div className={`${styles.card} ${styles.cardMac}`}>
          <div className={styles.macText}>
            {macbook?.title ? (
              <h2 className={styles.titleMac}>
                {getLoc(macbook.title, locale)}
              </h2>
            ) : (
              <h2 className={styles.titleMac}>
                Macbook <br />
                <strong>Air</strong>
              </h2>
            )}
            <p className={styles.desc}>
              {getLoc(macbook?.subtitle, locale) ||
                t("smallerBanners.macbook.desc")}
            </p>
            <button
              className={styles.shopBtn}
              onClick={() =>
                router.push(
                  macbookBtn && macbook?.buttonLink
                    ? macbook.buttonLink!
                    : "/catalog/Computers",
                )
              }
            >
              {macbookBtn || t("home.shopNow")}
            </button>
          </div>

          <div className={styles.imgMacContainer}>
            <picture>
              <source
                media="(max-width: 1536px)"
                srcSet={getImgSrc(macbook, DEFAULT_IMAGES_MOBILE[3])}
              />
              <img
                className={styles.imgMac}
                src={getImgSrc(macbook, DEFAULT_IMAGES[3])}
                alt={getLoc(macbook?.title, locale) || "Macbook Air"}
              />
            </picture>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmallerBanners;
