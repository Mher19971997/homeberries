import React from "react";
import { ChevronDownIcon } from "@homeberris/assets/icons/reviews";
import styles from "./index.module.css";

const STORAGE_KEYWORDS = ["памят", "хранил", "storage"];
const INITIAL_VISIBLE = 2;

interface Props {
  catalog?: any;
}

export default function ProductDetailsSection({ catalog }: Props) {
  const [showAll, setShowAll] = React.useState(false);

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

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Details</h2>

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

        {specs.length > INITIAL_VISIBLE && (
          <button className={styles.viewMoreBtn} onClick={() => setShowAll((p) => !p)}>
            {showAll ? "View Less" : "View More"}
            <ChevronDownIcon
              style={{ transform: showAll ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
            />
          </button>
        )}
      </div>
    </section>
  );
}
