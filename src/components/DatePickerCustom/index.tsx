"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.css";
import { useTranslation } from "react-i18next";

interface DatePickerCustomProps {
  value: Date | null;
  onChange: (date: Date) => void;
  onReset?: () => void;
  placeholder: string;
  disablePast?: boolean;
  selected?: boolean;
}

const buildMonthMatrix = (year: number, month: number): (Date | null)[][] => {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
};

const isSameDay = (a: Date | null, b: Date | null) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isBeforeToday = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
};

export default function DatePickerCustom({
  value,
  onChange,
  onReset,
  placeholder,
  disablePast,
  selected,
}: DatePickerCustomProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation("common");

  const weekdays = t("checkout.shipping.datePicker.weekdays", {
    returnObjects: true,
  }) as string[];

  const months = t("checkout.shipping.datePicker.months", {
    returnObjects: true,
  }) as string[];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const weeks = buildMonthMatrix(viewDate.getFullYear(), viewDate.getMonth());

  const monthLabel = `${months[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

  const goPrevMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const goNextMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const handlePick = (date: Date) => {
    if (disablePast && isBeforeToday(date)) return;
    onChange(date);
    setOpen(false);
  };

  const handleReset = () => {
    setViewDate(new Date());
    onReset?.();
  };

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <span
        className={`${styles.trigger} ${selected ? styles.triggerSelected : ""}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        {value
          ? `${value.getDate()} ${months[value.getMonth()]} ${value.getFullYear()}`
          : placeholder}
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>

      {open && (
        <div className={styles.popover} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={goPrevMonth}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className={styles.monthLabel}>{monthLabel}</span>
            <button
              type="button"
              className={styles.navBtn}
              onClick={goNextMonth}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className={styles.weekRow}>
            {weekdays.map((d) => (
              <span key={d} className={styles.weekday}>
                {d}
              </span>
            ))}
          </div>

          {weeks.map((week, wi) => (
            <div key={wi} className={styles.weekRow}>
              {week.map((date, di) => {
                if (!date) return <span key={di} className={styles.dayEmpty} />;
                const disabled = !!disablePast && isBeforeToday(date);
                const isSelected = isSameDay(date, value);
                const isToday = isSameDay(date, new Date());
                return (
                  <button
                    type="button"
                    key={di}
                    disabled={disabled}
                    className={`${styles.day} ${isSelected ? styles.daySelected : ""} ${isToday ? styles.dayToday : ""} ${disabled ? styles.dayDisabled : ""}`}
                    onClick={() => handlePick(date)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          ))}

          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleReset}
          >
            {t("checkout.shipping.datePicker.reset")}
          </button>
        </div>
      )}
    </div>
  );
}
