import React from "react";
import { ChevronDownIcon } from "@homeberris/assets/icons/reviews";
import styles from "./index.module.css";

const staticDescription =
  "Just so I know is judged by its cover, the first thing you notice when you pick up a modern smartphone is the display. Nothing anything, from our smartphones drive our life or quality! wait the display makes sure you're set up for the best actions and options, leaving you feel like you're really somewhere, and how great that is even satisfied quite a lot thing is fine with displays. Bold colors and sharp characters always promise the quality of the actors provided by the producers of the California brand, and then you'll 5.7 inch Retina genius, where you'll achieve as enjoyed the ambitions for many.";

const staticSpecs = [
  {
    group: "Screen",
    rows: [
      { label: "Screen diagonal", value: '6.7"' },
      { label: "Screen resolution", value: "2796×1290" },
      { label: "Screen refresh rate", value: "120 Hz" },
      { label: "Color density", value: "460 ppi" },
      { label: "Screen type", value: "OLED" },
      {
        label: "Additionally",
        value:
          "Dynamic Island\nAlways-On display\nHDR display\nTrue Tone\nWide color (P3)",
      },
    ],
  },
  {
    group: "CPU",
    rows: [
      { label: "CPU", value: "A16 Bionic" },
      { label: "Number of cores", value: "6" },
    ],
  },
  {
    group: "Camera",
    rows: [
      { label: "Main camera", value: "48 MP + 12 MP + 12 MP" },
      { label: "Front camera", value: "12 MP" },
      { label: "Optical zoom", value: "3x" },
      { label: "Video recording", value: "4K 60fps" },
    ],
  },
  {
    group: "Battery",
    rows: [
      { label: "Battery capacity", value: "4323 mAh" },
      { label: "Fast charging", value: "Yes, 20W" },
      { label: "Wireless charging", value: "MagSafe 15W" },
    ],
  },
  {
    group: "Memory",
    rows: [
      { label: "RAM", value: "6 GB" },
      { label: "Storage options", value: "128 GB / 256 GB / 512 GB / 1 TB" },
    ],
  },
];

const INITIAL_VISIBLE = 2;

export default function ProductDetailsSection() {
  const [showAll, setShowAll] = React.useState(false);

  const visibleSpecs = showAll ? staticSpecs : staticSpecs.slice(0, INITIAL_VISIBLE);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Details</h2>

        <p className={styles.description}>{staticDescription}</p>

        <div className={styles.specsTable}>
          {visibleSpecs.map((group) => (
            <div key={group.group} className={styles.specGroup}>
              <h3 className={styles.groupTitle}>{group.group}</h3>
              {group.rows.map((row) => (
                <div key={row.label} className={styles.specRow}>
                  <span className={styles.specLabel}>{row.label}</span>
                  <span className={styles.specValue}>
                    {row.value.split("\n").map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < row.value.split("\n").length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <button className={styles.viewMoreBtn} onClick={() => setShowAll((p) => !p)}>
          {showAll ? "View Less" : "View More"}
          <ChevronDownIcon
            style={{ transform: showAll ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
          />
        </button>
      </div>
    </section>
  );
}
