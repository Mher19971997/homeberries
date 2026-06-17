"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import Breadcrumb from "@homeberris/components/Breadcrumb";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { insertContactMessage } from "@homeberris/http/contactMessagesApi";
import { getToken } from "@homeberris/utils/auth";
import { useCookies } from "react-cookie";

const ContactPage: React.FC = () => {
  const { t } = useTranslation("common");
  const [form, setForm] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [cookies] = useCookies(['token']);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    try {
      const token = getToken() || cookies.token;
      await insertContactMessage(form, token);
      setSent(true);
      setForm({ name: "", surname: "", phone: "", email: "", message: "" });
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const faqItems = t("contact.faq.items", { returnObjects: true }) as {
    q: string;
    a: string;
  }[];

  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: t("nav.home"), href: "/" },
          { label: t("nav.contact") },
        ]}
      />

      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>{t("contact.hero.title")}</h1>
        <p className={styles.heroSubtitle}>{t("contact.hero.subtitle")}</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.formCard}>
          {sent ? (
            <div className={styles.success}>
              <span className={styles.successIcon}>✓</span>
              <p className={styles.successText}>{t("contact.form.success")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="name" className={styles.label}>
                    {t("contact.form.name")}
                  </label>
                  <input
                    id="name"
                    className={styles.input}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={t("contact.form.namePlaceholder")}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="surname" className={styles.label}>
                    {t("contact.form.surname")}
                  </label>
                  <input
                    id="surname"
                    className={styles.input}
                    name="surname"
                    value={form.surname}
                    onChange={handleChange}
                    placeholder={t("contact.form.surnamePlaceholder")}
                    required
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="phoneNumber" className={styles.label}>
                    {t("contact.form.phone")}
                  </label>
                  <input
                    id="phoneNumber"
                    className={styles.input}
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder={t("contact.form.phonePlaceholder")}
                    type="tel"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    {t("contact.form.email")}
                  </label>
                  <input
                    className={styles.input}
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder={t("contact.form.emailPlaceholder")}
                    type="email"
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="message" className={styles.label}>
                  {t("contact.form.message")}
                </label>
                <textarea
                  id="message"
                  className={styles.textarea}
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder={t("contact.form.messagePlaceholder")}
                  rows={5}
                  required
                />
              </div>

              {error && (
                <p className={styles.error}>{t("contact.form.error")}</p>
              )}

              <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? t("contact.form.submitting") : t("contact.form.submit")}
              </button>
            </form>
          )}
        </div>

        <div className={styles.mapCard}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12345!2d44.5125!3d40.1872!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDExJzEzLjkiTiA0NMKwMzAnNDUuMCJF!5e0!3m2!1sen!2s!4v1234567890"
            className={styles.map}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>{t("contact.faq.title")}</h2>
        <p className={styles.faqSubtitle}>{t("contact.faq.subtitle")}</p>
        <div className={styles.faqList}>
          {Array.isArray(faqItems) &&
            faqItems.map((item, i) => (
              <Accordion
                key={i}
                disableGutters
                elevation={0}
                className={styles.accordion}
                sx={{
                  border: "1px solid #f0f0f5",
                  borderRadius: "12px !important",
                  "&:before": { display: "none" },
                  "&.Mui-expanded": { margin: 0 },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#1a1a2e" }} />}
                  sx={{
                    padding: "0 20px",
                    minHeight: "56px",
                    "& .MuiAccordionSummary-content": { margin: "16px 0" },
                  }}
                >
                  <span className={styles.accordionQ}>{item.q}</span>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: "0 20px 20px" }}>
                  <p className={styles.accordionA}>{item.a}</p>
                </AccordionDetails>
              </Accordion>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;