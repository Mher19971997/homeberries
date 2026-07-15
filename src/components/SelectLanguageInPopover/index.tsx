"use client";

import * as React from "react";
import Popover from "@mui/material/Popover";
import SelectLanguageItem from "../SelectLanguageItem";
import styles from "@homeberris/components/SelectLanguageInPopover/index.module.css";
import { Box } from "@mui/material";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useParams, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

interface SelectLanguageInPopoverProps {
  children?: React.ReactNode;
}

interface SelectlanguageItem {
  id: number;
  flagIconName: string;
  language: string;
  locale: string;
}

const SelectLanguageInPopover: React.FC<SelectLanguageInPopoverProps> = ({
  children,
}) => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLocale = (params?.locale as string) ?? "ru";
  const { t } = useTranslation("common");

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const languages: SelectlanguageItem[] = [
    { id: 1, flagIconName: "fi-ru", language: "Русский", locale: "ru" },
    { id: 2, flagIconName: "fi-us", language: "English", locale: "en" },
    { id: 3, flagIconName: "fi-am", language: "Հայերեն", locale: "hy" },
  ];

  // URL — источник правды для активного языка
  const currentLanguage =
    languages.find((l) => l.locale === currentLocale) ?? languages[0];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // ===== SELECT LANGUAGE =====
  const handleLanguageSelect = (option: SelectlanguageItem) => {
    if (option.locale === currentLocale) {
      handleClose();
      return;
    }
    document.cookie = `NEXT_LOCALE=${option.locale}; path=/; max-age=31536000`;
    const segments = (pathname ?? "/").split("/");
    segments[1] = option.locale;
    const newPath = segments.join("/") || `/${option.locale}`;
    const query = searchParams.toString();
    const finalPath = query ? `${newPath}?${query}` : newPath;

    console.log(787878, finalPath);
    router.push(finalPath);
    
    // router.push(newPath);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "language-popover" : undefined;

  useEffect(() => {
    if (!open) return;

    const handleScroll = () => handleClose();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [open]);

  return (
    <Box>
      {children ? (
        <Box
          component="span"
          onClick={handleClick}
          aria-describedby={id}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          {children}
        </Box>
      ) : (
        <Box
          className={styles.trigger}
          onClick={handleClick}
          aria-describedby={id}
          component="button"
          sx={{
            background: "transparent",
            border: "none",
            p: 0,
            m: 0,
            cursor: "pointer",
          }}
        >
          <span
            className={`fi ${currentLanguage.flagIconName} ${styles.flagIcon}`}
          />
        </Box>
      )}

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableScrollLock
        transitionDuration={0}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ className: styles.popoverPaper }}
      >
        <Box className={styles.popover}>
          <Box className={styles.languagesList}>
            {languages.map((language) => (
              <SelectLanguageItem
                key={language.id}
                {...language}
                isSelected={currentLanguage.locale === language.locale}
                onSelect={() => handleLanguageSelect(language)}
              />
            ))}
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default SelectLanguageInPopover;