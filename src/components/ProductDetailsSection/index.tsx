import React from "react";
import { ChevronDownIcon } from "@homeberris/assets/icons/reviews";
import styles from "./index.module.css";
import { useTranslation } from "react-i18next";

<<<<<<< Updated upstream
const STORAGE_KEYWORDS = ["памят", "хранил", "storage"];
=======
const staticDescription =
  "Just so I know is judged by its cover, the first thing you notice when you pick up a modern smartphone is the display. Nothing anything, from our smartphones drive our life or quality! wait the display makes sure you're set up for the best actions and options, leaving you feel like you're really somewhere, and how great that is even satisfied quite a lot thing is fine with displays. Bold colors and sharp characters always promise the quality of the actors provided by the producers of the California brand, and then you'll 5.7 inch Retina genius, where you'll achieve as enjoyed the ambitions for many.";



>>>>>>> Stashed changes
const INITIAL_VISIBLE = 2;

interface Props {
  catalog?: any;
}

export default function ProductDetailsSection({ catalog }: Props) {
  const [showAll, setShowAll] = React.useState(false);

<<<<<<< Updated upstream
  const dynamicSpecs = React.useMemo(() => {
    if (!catalog?.groupOption?.length) return [];
    return catalog.groupOption
      .filter((g: any) => !STORAGE_KEYWORDS.some(k => g.name?.toLowerCase().includes(k)))
      .map((g: any) => ({
        group: g.name,
        rows: (g.options || []).map((o: any) => ({ label: o.name || "", value: o.value || "" })),
      }))
      .filter((g: any) => g.rows.length > 0);
  }, [catalog]);

  const specs = dynamicSpecs.length > 0 ? dynamicSpecs : [];
  const visibleSpecs = showAll ? specs : specs.slice(0, INITIAL_VISIBLE);

  if (specs.length === 0) return null;
=======
  const { t } = useTranslation('common');
  
  const staticSpecs = [
    {
      group: t('productDetails.specs.screen'),
      rows: [
        { label: t('productDetails.specs.labels.screenDiagonal'), value: '6.7"' },
        { label: t('productDetails.specs.labels.screenResolution'), value: "2796×1290" },
        { label: t('productDetails.specs.labels.screenRefreshRate'), value: "120 Hz" },
        { label: t('productDetails.specs.labels.colorDensity'), value: "460 ppi" },
        { label: t('productDetails.specs.labels.screenType'), value: "OLED" },
        {
          label: t('productDetails.specs.labels.additionally'),
          value:
            "Dynamic Island\nAlways-On display\nHDR display\nTrue Tone\nWide color (P3)",
        },
      ],
    },
    {
      group: "CPU",
      rows: [
        { label: "CPU", value: "A16 Bionic" },
        { label: t('productDetails.specs.labels.cores'), value: "6" },
      ],
    },
    {
      group: t('productDetails.specs.camera'),
      rows: [
        { label: t('productDetails.specs.labels.mainCamera'), value: "48 MP + 12 MP + 12 MP" },
        { label: t('productDetails.specs.labels.frontCamera'), value: "12 MP" },
        { label: t('productDetails.specs.labels.opticalZoom'), value: "3x" },
        { label: t('productDetails.specs.labels.video'), value: "4K 60fps" },
      ],
    },
    {
      group: t('productDetails.specs.battery'),
      rows: [
        { label: t('productDetails.specs.labels.batteryCapacity'), value: "4323 mAh" },
        { label: t('productDetails.specs.labels.fastCharging'), value: "Yes, 20W" },
        { label: t('productDetails.specs.labels.wirelessCharging'), value: "MagSafe 15W" },
      ],
    },
    {
      group: t('productDetails.specs.memory'),
      rows: [
        { label: "RAM", value: "6 GB" },
        { label: t('productDetails.specs.labels.storage'), value: "128 GB / 256 GB / 512 GB / 1 TB" },
      ],
    },
  ];

  const visibleSpecs = showAll ? staticSpecs : staticSpecs.slice(0, INITIAL_VISIBLE);
>>>>>>> Stashed changes

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>{t('productDetails.title')}</h2>

        {catalog?.description && (
          <p className={styles.description}>{catalog.description}</p>
        )}

        <div className={styles.specsTable}>
          {visibleSpecs.map((group) => (
            <div key={group.group} className={styles.specGroup}>
              <h3 className={styles.groupTitle}>{group.group}</h3>
              {group.rows.map((row: any) => (
                <div key={row.label} className={styles.specRow}>
                  <span className={styles.specLabel}>{row.label}</span>
                  <span className={styles.specValue}>{row.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

<<<<<<< Updated upstream
        {specs.length > INITIAL_VISIBLE && (
          <button className={styles.viewMoreBtn} onClick={() => setShowAll((p) => !p)}>
            {showAll ? "View Less" : "View More"}
            <ChevronDownIcon
              style={{ transform: showAll ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
            />
          </button>
        )}
=======
        <button className={styles.viewMoreBtn} onClick={() => setShowAll((p) => !p)}>
          {showAll ? `${t('productDetails.viewLess')}` : `${t('productDetails.viewMore')}`}
          <ChevronDownIcon
            style={{ transform: showAll ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
          />
        </button>
>>>>>>> Stashed changes
      </div>
    </section>
  );
}
