"use client";
import React, { useState, useMemo } from "react";

const getLoc = (val: any, locale = 'en'): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[locale] || val.en || val.ru || '';
};
import styles from "./index.module.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllBaskets } from "@homeberris/http/basketApi";
import { getDeliveryAddressApi } from "@homeberris/http/deliveryAddressApi";
import qs from "qs";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";
import { useAuth } from "@homeberris/hooks/useAuth";
import { useToast } from "@homeberris/hooks/useToast";
import { getBasketItems } from "@homeberris/utils/indexedDB";
import { BasketDataItem } from "@homeberris/types/basket";
import SelectPaymentMethod from "@homeberris/components/SelectPaymentMethod";
import {
  AddAddressIcon,
  EditIcon,
  LocationIcon,
  PaymentIcon,
  ShippingIcon,
} from "@homeberris/assets/icons/order";
import WiFiCard from "@homeberris/assets/icons/wifi";
import MastercardIcon from "@homeberris/assets/icons/mastercard";
import { useMutation, useQueryClient as useQC } from "@tanstack/react-query";
import { useLoadScript } from "@react-google-maps/api";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { createDeliveryAddress, updateDeliveryAddress, deleteDeliveryAddress } from "@homeberris/http/deliveryAddressApi";
import { useTranslation } from "react-i18next";
import CustomModal from "@homeberris/components/CustomModal";
import DatePickerCustom from "@homeberris/components/DatePickerCustom";

const GOOGLE_LIBRARIES: ("places")[] = ["places"];

interface Address {
  uuid: string;
  label: string;
  tag: "HOME" | "OFFICE" | string;
  street: string;
  phone: string;
}

interface ShipmentMethod {
  id: string;
  label: string;
  description: string;
  price: number | null;
  date: string | null;
}

interface CheckoutItem {
  uuid?: string;
  name: string;
  price: number;
  image?: string;
}

function StepIndicator({ current, steps }: { current: number, steps: string[] }) {
  const { t } = useTranslation('common');
  return (
    <div className={styles.stepIndicator} data-step={current}>
      {steps.map((label, i) => {
        const state =
          i < current ? "done" : i === current ? "active" : "pending";

        return (
          <div key={i} className={`${styles.step} ${styles[state]}`}>
            <div className={styles.stepCircle}>
              {React.createElement(STEP_ICONS[i], {
                className: styles.stepIcon,
              })}
            </div>

            <div className={styles.stepMeta}>
              <span>{t('checkout.steps.step')} {i + 1}</span>
              <span>{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AddressForm({
  initial,
  token,
  onSave,
  onCancel,
  isLoaded,
}: {
  initial?: { uuid: string; address: string; lat: string; lng: string };
  token: string;
  onSave: () => void;
  onCancel: () => void;
  isLoaded: boolean;
}) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    defaultValue: initial?.address || "",
    initOnMount: isLoaded,
  });

  const [lat, setLat] = React.useState(initial?.lat || "");
  const [lng, setLng] = React.useState(initial?.lng || "");
  const [saving, setSaving] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const { t } = useTranslation('common');

  const qc = useQC();

  const handleSelect = async (address: string) => {
    setValue(address, false);
    clearSuggestions();
    setShowSuggestions(false);
    try {
      const results = await getGeocode({ address });
      const coords = await getLatLng(results[0]);
      setLat(String(coords.lat));
      setLng(String(coords.lng));
    } catch {}
  };

  const handleSave = async () => {
    if (!value.trim()) return;
    setSaving(true);
    try {
      const authToken = token || (typeof window !== 'undefined' ? (document.cookie.match(/token=([^;]+)/)?.[1] || '') : '');
      if (initial?.uuid) {
        await updateDeliveryAddress(initial.uuid, { address: value, lat, lng }, authToken);
      } else {
        await createDeliveryAddress({ address: value, lat, lng }, authToken);
      }
      qc.invalidateQueries({ queryKey: ["getDeliveryAddresses"] });
      onSave();
    } catch {} finally {
      setSaving(false);
    }
  };

  if (!isLoaded) return <p className={styles.addressLine}>{t('checkout.form.loading')}</p>;

  return (
    <div className={styles.addressFormBox}>
      <div style={{ position: "relative" }}>
        <input
          className={styles.addressInput}
          value={value}
          onChange={(e) => { setValue(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          disabled={!ready}
          placeholder={t('checkout.form.placeholder')}
        />
        {showSuggestions && status === "OK" && (
          <div className={styles.suggestionsList}>
            {data.map(({ place_id, description }: any) => (
              <div
                key={place_id}
                className={styles.suggestionItem}
                onClick={() => handleSelect(description)}
              >
                {description}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={styles.addressFormBtns}>
        <button className={styles.btnBack} onClick={onCancel}>{t('checkout.form.cancel')}</button>
        <button className={styles.btnNext} onClick={handleSave} disabled={saving || !value.trim()}>
          {saving ? t('checkout.form.saving') : t('checkout.form.save')}
        </button>
      </div>
    </div>
  );
}

function AddressStep({
  addresses,
  selected,
  onSelect,
  token,
  isLoaded,
}: {
  addresses: Address[];
  selected: string;
  onSelect: (uuid: string) => void;
  token: string;
  isLoaded: boolean;
}) {
  const [showForm, setShowForm] = React.useState(false);
  const [editAddr, setEditAddr] = React.useState<Address | null>(null);
  const [confirmDeleteUuid, setConfirmDeleteUuid] = React.useState<string | null>(null);
  const qc = useQC();

  const handleDelete = (uuid: string, e: React.MouseEvent) => {
    e.preventDefault();
    setConfirmDeleteUuid(uuid);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteUuid) return;
    await deleteDeliveryAddress(confirmDeleteUuid, token);
    qc.invalidateQueries({ queryKey: ["getDeliveryAddresses"] });
    setConfirmDeleteUuid(null);
  };

  const handleEdit = (addr: Address, e: React.MouseEvent) => {
    e.preventDefault();
    setEditAddr(addr);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditAddr(null);
  };
  const { t } = useTranslation('common');

  return (
    <div className={styles.stepContent}>
      <div className={styles.addressList}>
        <h2 className={styles.sectionTitle}>{t('checkout.address.title')}</h2>
        {addresses.map((addr) => (
          <label
            key={addr.uuid}
            className={`${styles.addressCard} ${selected === addr.uuid ? styles.addressCardSelected : ""}`}
          >
            <input
              type="radio"
              name="address"
              value={addr.uuid}
              checked={selected === addr.uuid}
              onChange={() => onSelect(addr.uuid)}
              className={styles.radioHidden}
            />
            <div className={styles.radioCircle}>
              {selected === addr.uuid && <div className={styles.radioInner} />}
            </div>
            <div className={styles.addressBody}>
              <div className={styles.addressHeader}>
                <span className={styles.addressLabel}>{addr.label}</span>
                <span className={styles.addressTag}>{addr.tag}</span>
              </div>
              {addr.street.split("\n").map((line, i) => (
                <p key={i} className={styles.addressLine}>{line}</p>
              ))}
            </div>
            <div className={styles.addressActions}>
              <button className={styles.iconBtn} title="Edit" onClick={(e) => handleEdit(addr, e)}>
                <EditIcon />
              </button>
              <button className={styles.iconBtn} title="Delete" onClick={(e) => handleDelete(addr.uuid, e)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </label>
        ))}

        {showForm ? (
          <AddressForm
            token={token}
            initial={editAddr ? { uuid: editAddr.uuid, address: editAddr.street, lat: "", lng: "" } : undefined}
            onSave={handleFormClose}
            onCancel={handleFormClose}
            isLoaded={isLoaded}
          />
        ) : (
          <button className={styles.addAddressBtn} onClick={() => { setEditAddr(null); setShowForm(true); }}>
            <span className={styles.addIcon}><AddAddressIcon /></span>
            {t('checkout.address.addNew')}
          </button>
        )}
      </div>

      <CustomModal
        open={confirmDeleteUuid !== null}
        title={t('checkout.confirm.title')}
        width={400}
        handleClose={() => setConfirmDeleteUuid(null)}
      >
        <div className={styles.confirmBody}>
          <div className={styles.confirmIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 11v5M14 11v5" stroke="#000" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <p className={styles.confirmText}>{t('checkout.confirm.description')}</p>
          <div className={styles.confirmActions}>
            <button className={styles.confirmCancel} onClick={() => setConfirmDeleteUuid(null)}>{t('checkout.confirm.cancel')}</button>
            <button className={styles.confirmDelete} onClick={handleConfirmDelete}>{t('checkout.confirm.delete')}</button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}

const STEP_ICONS = [LocationIcon, ShippingIcon, PaymentIcon];

function ShippingStep({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation('common');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const SHIPMENT_METHODS: ShipmentMethod[] = [
    {
      id: "free",
      label: `${t('checkout.shipping.free')}`,
      description: `${t('checkout.shipping.regularlyShipment')}`,
      price: null,
      date: "17 Oct, 2023",
    },
    {
      id: "fast",
      label: "$8.50",
      description: `${t('checkout.shipping.descriptionFast')}`,
      price: 8.5,
      date: "1 Oct, 2023",
    },
    {
      id: "schedule",
      label: `${t('checkout.shipping.schedule')}`,
      description: `${t('checkout.shipping.descriptionSchedule')}`,
      price: null,
      date: null,
    },
  ];

  return (
    <div className={styles.stepContent}>
      <div className={styles.shipmentList}>
        <h2 className={styles.sectionTitle}>{t('checkout.shipping.title')}</h2>
        {SHIPMENT_METHODS.map((method) => (
          <label
            key={method.id}
            className={`${styles.shipmentCard} ${selected === method.id ? styles.shipmentCardSelected : ""}`}
          >
            <input
              type="radio"
              name="shipment"
              value={method.id}
              checked={selected === method.id}
              onChange={() => onSelect(method.id)}
              className={styles.radioHidden}
            />
            <div className={styles.shipmentMain}>
              <div className={styles.radioCircle}>
                {selected === method.id && (
                  <div className={styles.radioInner} />
                )}
              </div>

              <div className={styles.shipmentText}>
                <span className={styles.shipmentLabel}>{method.label}</span>
                <span className={styles.shipmentDesc}>
                  {method.description}
                </span>
              </div>
            </div>
            <div className={styles.shipmentDate}>
              {method.date ? (
                <span>{method.date}</span>
              ) : method.id === "schedule" ? (
                <DatePickerCustom
                  value={scheduledDate}
                  placeholder={t('checkout.shipping.date')}
                  disablePast
                  selected={selected === method.id}
                  onChange={(newDate) => {
                    setScheduledDate(newDate);
                    onSelect(method.id);
                  }}
                  onReset={() => setScheduledDate(null)}
                />
              ) : null}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

type PaymentTab = "Credit Card" | "PayPal" | "PayPal Credit";

function PaymentStep({
  items,
  subtotal,
  tax,
  shippingCost,
  total,
  address,
  shipmentMethod,
  onPaymentSuccess,
  onPaymentError,
  onBack,
  onNext,
}: {
  items: CheckoutItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  address: string;
  shipmentMethod: string;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [tab, setTab] = useState<PaymentTab>("Credit Card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expDate, setExpDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [showStripe, setShowStripe] = useState(false);
  const { t } = useTranslation('common');

  const fmt = (n: number) => `$${n}`;
  const TABS: PaymentTab[] = ["Credit Card", "PayPal", "PayPal Credit"];
  const shipLabel =
    shipmentMethod === "free"
      ? `${t('checkout.shipping.free')}`
      : shipmentMethod === "fast"
        ? "$8.50"
        : "Scheduled";

  return (
    <div className={styles.paymentLayout}>
      {/* Summary Panel (Слева) */}
      <div className={styles.summaryPanel}>
        <div className={styles.summary}>
          <h3 className={styles.summaryPanelTitle}>{t('checkout.payment.summary')}</h3>
        </div>
        <div className={styles.summaryItems}>
          {items.map((item, i) => (
            <div key={item.uuid ?? i} className={styles.summaryItem}>
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className={styles.summaryItemImg}
                />
              )}
              <span className={styles.summaryItemName}>{item.name}</span>
              <span className={styles.summaryItemPrice}>{fmt(item.price)}</span>
            </div>
          ))}
        </div>
        <div className={styles.details}>
          <div className={styles.addressDetails}>
            <div className={styles.summaryMeta}>
              <p className={styles.summaryMetaLabel}>{t('checkout.payment.address')}</p>
              <p className={styles.summaryMetaValue}>
                {address || "1131 Dusty Townline, Jacksonville, TX 40322"}
              </p>
            </div>
            <div className={styles.summaryMeta}>
              <p className={styles.summaryMetaLabel}>{t('checkout.payment.shipmentMethod')}</p>
              <p className={styles.summaryMetaValue}>{shipLabel}</p>
            </div>
          </div>
          <div className={styles.summaryTotals}>
            <div className={styles.summaryTotalRow}>
              <span>{t('checkout.payment.subtotal')}</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className={styles.taxes}>
              <div className={`${styles.summaryTotalRow} ${styles.muted}`}>
                <span>{t('checkout.payment.tax')}</span>
                <span>{fmt(tax)}</span>
              </div>
              <div className={`${styles.summaryTotalRow} ${styles.muted}`}>
                <span>{t('checkout.payment.estimated')}</span>
                <span>{fmt(shippingCost)}</span>
              </div>
            </div>
            <div className={`${styles.summaryTotalRow} ${styles.totalRow}`}>
              <span>{t('checkout.payment.total')}</span>
              <span>{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form Panel (Справа) */}
      <div className={styles.paymentPanel}>
        <div className={styles.paymentSection}>
          <h2 className={styles.sectionTitle}>{t('checkout.payment.title')}</h2>
          <div className={styles.paymentTabs}>
            {TABS.map((t) => (
              <button
                key={t}
                className={`${styles.paymentTab} ${tab === t ? styles.paymentTabActive : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        {tab === "Credit Card" && !showStripe && (
          <>
            <div className={styles.cardDetails}>
              <div className={styles.cardVisual}>
                {/* <svg
                  width="299"
                  height="24"
                  viewBox="0 0 299 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                  <rect
                    x="5.74841"
                    y="1.75"
                    width="20.5"
                    height="20.5"
                    fill="url(#pattern0_6915_907)"
                  />
                  <path
                    d="M48.6968 3C50.813 5.52153 51.973 8.70813 51.973 12C51.973 15.2919 50.813 18.4785 48.6968 21"
                    stroke="white"
                    strokeWidth="1.4371"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M45.6368 18.45C47.1596 16.6458 47.995 14.361 47.995 12C47.995 9.63908 47.1596 7.35426 45.6368 5.55005"
                    stroke="white"
                    strokeWidth="1.4371"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M42.5868 15.8699C43.5005 14.7874 44.0017 13.4165 44.0017 11.9999C44.0017 10.5833 43.5005 9.21241 42.5868 8.12988"
                    stroke="white"
                    strokeWidth="1.4371"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <defs>
                    <pattern
                      id="pattern0_6915_907"
                      patternContentUnits="objectBoundingBox"
                      width="1"
                      height="1"
                    >
                      <use
                        xlinkHref="#image0_6915_907"
                        transform="scale(0.00195312)"
                      />
                    </pattern>
                    <image
                      id="image0_6915_907"
                      width="512"
                      height="512"
                      preserveAspectRatio="none"
                      xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAgAElEQVR4nO3deXydVb3v8e969s6ctGnTUmhLB7DQBhnT7p0WCkEZRQGVoqDiAOI56hUEPEdfnqt4jlc8AhfwcD3gACKKQhWRI7YoSoXSdKcEaSmlpQhtOtAhHdMkO8N+1v2DFkunpNlr7yfJ+rz/avbwWz/+4fnu51mDBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD9jom6gQgFM2bMGBGGYZW1ttRaa4IgqIy6KQBA7oRhuN0YY40xbQUFBc3PPvvsFklh1H1FYVAHgGQyOcQYc2IYhicGQXCctXaipAnW2jHGmJFR9wcAiJ61drOktUEQrJK0KgzDFbFY7KUgCF567rnnWqLuL1cGUwAwyWTyRGPM6dbaGdba6caYYzS4/hsBAPljJf1dUr21dkEsFnuuvr5+6e7XB7wBfXGsqakZWlBQcIGkC621F0gaFXVPAIBBbYOkucaYOV1dXU82NjbuiLqhvhpwAaCurq48nU5fYq293Fp7vjGmKOqeAABeSkt60lr7cDqdfnzJkiWtUTd0OAZMAEgmkzWSrpV0haSKiNsBAGBvLZJ+KenBVCo1P+pmeqNfB4C6urp4e3v7ZcaYG6y106LuBwCAXmgwxtxeXFz86Lx587qjbuZg+mUAqKurK06n09daa2+QND7qfgAA6INV1trbq6qqfjRnzpyOqJvZV78KADU1NQWxWOwKY8zNkiZG3Q8AAA6skXT78OHD7+lPQaDfBIDa2tpzrLV3SaqOuhcAAHJgpbX26w0NDbOjbkTqBwFg+vTpk8Mw/L6kc6PuBQCAPHjSWvulhoaGV6NsIrIAUFdXF0+n0zdaa2+WVBxVHwAARCBtjPnPnTt3fmfZsmWdUTQQSQBIJBInG2N+JumkKMYHAKCfWBwEwSfq6+tfyvfAsTyPZ5LJ5LXGmNmSxuZ5bAAA+psjwzD8zNFHH921du3aeuVxm+G83QFIJBJVxphfSDo/X2MCADCAzAmC4OP19fVb8zFYXgLA9OnTTw3D8DdiaR8AAIeyJgzDDy9atGhRrgcKcj1AIpG4MgzDBeLiDwBAT44OguCvtbW1H8n1QDm9A1BbW/t1a+1/5HqcbBTEjYoLjcpLYyoqCFRU0G9bHbC278po49aurGpUlAYaPaLQUUdA7qxv7lRLW5hVjVHDC1RZnu8pWoNfR5dVujNUa3tG6U6rru5+faqvlfT1VCp1S64GyMnVbtasWbHVq1ffY4y5Jhf1D1dB3GjyuGJNGlesMSMKNHpEocaMLNDokYUqjHPBz7XH52/XbQ9tyKrG2acN0beuGe2oIyB3vvnj9Xr6hZ1Z1bjpyiN18RmVjjrCwXR2W63b1Kn1zV1at7lT65q7tHJNWiua0v0pHPxw3Lhxn589e3bGdeG464I1NTUFTU1NDxpjcn774mAK4kY1x5fptONL9e5jSnT8uGIVcKEHAOylMG40cXSRJo5+56nyXd1Wy5vSWvr3Nr3wapteWNEWZSC4tqmpqaKmpuaTjY2N2d1K3YfTAHDhhRcWbd269RFJF7us2xvFhYES1WU669RyzTixQmXFOZ/eAAAYhAriRiceU6ITjynRFedWaVd7RvVLW/XXv7Uo9fIudXTlPQxcEY/HS6urqy93uWmQswAwa9as2Jo1ax5Uni/+Y48o1PtnVOoDZ1SqopSLPgDArfKSmM6dNkTnThuito5QTy3aqUfnbdPr6/N6rs8lFRUVD9fV1c1ydcSwkwCw++L/M2vtLBf1emKMNOPEcl1WN1ynHV8qw919AEAelBYFuviMSn3g9Eo1rmjVr5/epvqlu2Tzc1Pg0vb29vslfVJSdjNN5SgANDU13SXpShe1elIzuVSfu+QITR7P8QEAgGgYI02dXKapk8v0yuq07n1ss15Y0ZqPoT+eTCa3plKp67ItlHUAqK2tvcFa+4Vs6/Rk8vhife6SkaqZXJbroQAA6LUp44t153VH6/nlrbr3sc1a0ZTO9ZBfSiaTr6dSqbuyKZLVQ/NEInGptfbWbGr0pKTI6LrLR+mer4zn4g8A6LemTi7Tvf86Qf/rsiNUUpTzOWn/t7a2Nqs5d33ucOrUqccbYx7IpkZPTplUop98baI+XDdMQcCDfgBA/xYYadZ7huuBf5uoaVNy+qM1sNb+PJlMVve5QF++dPrpp1fEYrHHJA3p68CHUhA3uvGKI/X9L4/X2CPY/Q0AMLAcWVWg2754tG644shc7kNTIWl2XV1deV++3KcA0N3d/UNJk/vy3Z6MGl6g/3fjeF0yk12wAAADlzHSpTMrdfeN4zVqeEGuhqlub2//77588bADQCKRuErSR/syWE+mTSnTj782gRn+AIBBY8r4Yv3oqxNy+Ujg44lE4rBX4h1WAEgkEhONMf91uIP0xkUzKnXrF4/W0DIOwAAADC6V5TF97wtH68LaoTmpb4z5QW1t7YTD+c7hBABjjPmhcvDc/8N1w/QvHztSzPMDAAxWsUD66ieO0pXnVeWi/FBr7X06jEP+eh0Aamtrr5Z0Tl+6OhhjpM9/6Ahdd/kodvMDAAx6xkj/dOlIfe7Skbkof/bux/S90qsAMG3atCNzsd7/2ktG6qPnDHddFgCAfu1j51Xpmg+4DwHGmNtnzpzZq8K9CgBBEHxHktNp+R88a5g+lpvbIAAA9HtXXVily9/r/EdwVWdn57d788EeA8D06dNP1VsHDzhz7rShum7WES5LAgAw4HzhQ0fkYmLgNclksqanD/UYAMIwvLM3n+utk44t0deuOpKd/QAA3jNGuunKI/XuY0pclg0kfa83HzqoRCJxvqQzXXVUWRHTzVePUTzGxR8AAOmt3W+/dfUYVZY7XQb/nmQyefahPnDIAGCM+ZarToLA6BufHq0RlU5OIAYAYNAYOSyum68e7XQ5vLX2kHMBDhoAEonERZKSrhr59EVVmsppfgAAHNBpx5fpqgtHOKtnjJmRTCbPO9j7h7oD8BVXTRw7pogZ/wAA9OCT7xuhSWOLXJa86WBvHDAAJJPJGmPMWS5GDsxbOx/x3B8AgEOLBW9NCnT4KODc3av59nOwOwDXuxr5svcM0/HjONwHAIDemDKhRB+qG+asnrX2ugO9vl8ASCQSVZIuczHoyGFxXf3+nGx3CADAoPXZi49Q1VA3k+attZefcsop+23md6A7AFdJcvKT/ZMXjlBJkbMtBAAA8EJJkXE5IbCkqKjoY/u+uN/V2RhztYvRxows0Pum5+bYQwAABrv3zxiqo0YUuCp3zb4vvCMAJBKJkyWd4GKkz7x/JBP/AADoo4K40afe5+wuwCnJZLJ67xf2vQMwy8Uo40YV6b01FS5KAQDgrfOTQzVmpJu7ANbad1zj3xEAjDGXuxjk0jMr2esfAIAsBUa69Ew3KwL2vca/HQCmTp16vKRJ2Q5QXBjo/CTP/gEAcOF904equNDJhPrqGTNmHLvnj7crxmKxC11UP2dqhSpKmfkPAIALFaUxnX2am8fqmUzm/D3/3vtKfYGL4h84Y7+lhgAAIAsXz3RzbTXGvP1jP5CkmpqaAkkzsy08aniBJo93eqYxAADeq55QoiOGZT8Z0Fp71qxZs2LS7gAQBMEpkkqzLTzz5HIZ5v4BAOCUMdLpJ5W7KFWxatWqE6V/BIDTXVSdeTJL/wAAyIWZJzsJAG9f8/fMAUhkW3BIaUwnvSvrmwgAAOAATplUqorSmItStdI/AsDJ2VY7eVKpYkz+BwAgJ+IxoxOPdTLP7q1HABdeeGGRpOOyrVY9kSN/AQDIpRMmOgkAU6qrqwuD5ubmKZKyPnNwyngCAAAAuVQ9wcm1trCsrGxSEATBsT1/9tCCwOh4lv8BAJBTUyaWyMVO+7FY7Ni4pAnZFiopNHpwbnP2HWFQem1tR9QtAHlks67wzIstWt/c6aAXDEYlRYFa02FWNay1E+OSJmbbTGs61EN/3JptGQAY8EqKsp8N3bCsVQ3LWh10AxzUxMAYMzrqLgBgsKiscLJMC8i1MYG1dkTUXQDAYHH0EYVRtwD0xohAEgEAAByZMoEJ0RgQqgJJw6PuAgAGi4lHFalqaNYrq4FcqwoksYAfABwxRjpn6pCo2wB6UhxI4oEVADh08RmVTtZqAzlURAAAAMeOHlWo904dGnUbwKEUBZJYswIAjv3TpSNVUsRtAPRbcc7vA4AcGDksri/NGhV1G8BBEQAAIEcumlGpi8+ojLoN4IAIAACQQzdccaTOPo1VAeh/CAAAkEOBkb559Wh98KxhUbcCvAMBAAByLDDSlz8ySt/49GgNKWXeNfoHAgAA5Mk504bo5zcfow+eNUyFcVYIIFqxsWPH3hx1E0BPJh5VpLNPq4i6DSBrxYWBpr+7XO8/vVKV5THtbA21bVdG1kbdGXzjZMPqy84epsIC0iwO7LW1HZxtDuxj+JC4rjyvSleeV6UdrRm9tqZDTZs6tasto9Z0Jur20I91dln9+ultWddxEgA+fdFIVZTyNAEH9vj87QQA4BCGlsVUM7lUNZNLo24FA0BLW+gkAHDVBgDAQwQAAAA8RAAAAMBDBAAAADxEAAAAwEMEAAAAPEQAAADAQ4GkrBZoGyMVF7IJEAAAA0kgaV02BSrL4ypgT2sAAAaUQNJfsylw6nEljloBAAD5EhhjHsqmwDlTh7rqBQAA5EmwcOHCeZL+2Jcvv/uYEp1+UrnjlgAAQK4FktTd3f0pSWsP54tDSmP6t0+NluHxPwAAA04gSY2NjW8GQXCupJW9+dKo4QW64/pxGj2iIKfNAQCA3Hh7H4D6+vrl3d3d0yTdKqn9QB8uiBt9qG6Yfvy1CZo0tihfPQIAAMfie//R2Ni4Q9K/1NXV/Xs6nT4vDMMTayaXn3fyu0pmTDiqSNOmlKq8JBZRqwAAwJX4gV6cN2/eLkmPSnr02XuuSsuaGfltCwAA5BJbAQMA4CECAAAAHiIAAADgIQIAAAAeIgAAAOAhAgAAAB4iAAAA4CECAAAAHiIAAADgIQIAAAAeIgAAAOAhAgAAAB4iAAAA4CECAAAAHiIAAADgofjB3kgkElVBEEx+4Inm6lOPL9e4IwpVWRHLZ28AACBH9gsA06dPvyAMw3+VNNNaG/vJ77dIv9+iIDA6YUKxPnrucM08uSKCVgEAgCtvB4CamprSeDx+XxiGHznQB8PQ6qXX2/XSves048Ry/e9Pj1ZZMU8QAAAYiAJJqq6uLozH43MkHfDiv68FL+3S9Xc2Kd0Z5rQ5AACQG4EkVVRUfE/SmYfzxRVNad358MacNAUAAHIrSCaTkyR9vi9fnpvaqZVrOxy3BAAAci2Q9BlJBX35chha/X7+NrcdAQCAnAustednUyC1rM1VLwAAIE8CY8yEbAps3Nqp0LpqBwAA5EMgqTKbAplQam3POGoHAADkQyDJZF/GQQkAAJA37OQDAICHCAAAAHiIAAAAgIcIAAAAeIgAAACAhwgAAAB4iAAAAICHCAAAAHiIAAAAgIcIAAAAeIgAAACAhwgAAAB4iAAAAICHCAAAAHiIAAAAgIcIAAAAeIgAAACAhwgAAAB4iAAAAICHCAAAAHiIAAAAgIcIAAAAeIgAAACAh+Iuiry2Nq3SYrIEDmzj1q6oWwAGhO0tGe1s61Z7h426FfRjbenQSR0nAeC6O5tclAEAr6zb3KW/NO5U44o2rVyTVktbJuqW4BEnAQAA0HsvrGjVg09u1QsrWmX5sY+IEAAAIE+at3frjoc36tnFLVG3AhAAACAfFr3Sqv+4f7227+I2P/oHAgAA5NgfG3bquw++qe4M9/vRfxAAACCH5i/epe88sF4h1370M6zdA4AceX19h7513zou/uiXCAAAkANd3Vbf/PE6dXRx9Uf/RAAAgBx4+M9btXpDZ9RtAAdFAAAAx9o6Qv3yT1uibgM4JAIAADg2p36HWtrcbNcK5AoBAAAcm7twR9QtAD0iAACAQ9tbMnp1TTrqNoAeEQAAwKHFr7Wxvz8GBAIAADi0akNH1C0AvUIAAACHNm/rjroFoFecbAV8ZFWBAmNclMIg1JbOcAAKvNHWkf3s/8rymEqLYw66wWAUWqsNW7qyruMkAPzkaxNVUcrNBBzY4/O367aHNkTdBpAXGQdZ95qLR+riMyqzL4RBqaUt1EU3vZp1Ha7aAAB4iAAAAICHCAAAAHiIAAAAgIcIAAAAeIgAAACAhwgAAAB4iAAAAICHCAAAAHiIAAAAgIcIAAAAeIgAAACAhwgAAAB4iAAAAICHCAAAAHiIAAAAgIcIAAAAeIgAAACAhwgAAAB4iAAAAICHCAAAAHiIAAAAgIcIAAAAeIgAAACAhwgAAAB4iAAAAICHCAAAAHiIAAAAgIcIAAAAeIgAAACAhwgAAAB4iAAAAICHCAAAAHiIAAAAgIcIAAAAeIgAAACAhwgAAAB4iAAAAICHCAAAAHiIAAAAgIcIAAAAeIgAAACAhwgAAAB4iAAAAICHCAAAAHiIAAAAgIcIAAAAeIgAAACAhwgAAAB4iAAAAICHCAAAAHiIAAAAgIcIAAAAeIgAAACAhwgAAAB4iAAAAICHCAAAAHiIAAAAgIcIAAAAeIgAAACAhwgAAAB4iAAAAICHCAAAAHiIAAAAgIcIAAAAeIgAAACAhwgAAAB4KO6iyNW3vKHAGBelMAi1pTNRtwAMKD9+fLMe+uPWqNtAPxVa66SOkwCwYUuXizIAAEnbd2W0fRfBGbnFIwAAADxEAAAAwEMEAAAAPEQAAADAQwQAAAA8RAAAAMBDBAAAADxEAAAAwEMEAAAAPEQAAADAQwQAAAA8RAAAAMBDBAAAADxEAAAAwEMEAAAAPBR3UeSu68eptJgsgQN75sUWPTh3S9RtAAPGJy6o0pmnVETdBvqptnSo6+5syrqOkwDwrrHFqiglAODAVjSlo24BGFBGDS/Q8eOKo24D/VRLW+ikDldtAAA8RAAAAMBDBAAAADxEAAAAwEMEAAAAPEQAAADAQwQAAAA8RAAAAMBDBAAAADxEAAAAwEMEAAAAPEQAAADAQwQAAAA8RAAAAMBDBAAAADxEAAAAwEMEAAAAPEQAAADAQwQAAAA8RAAAAMBDBAAAADxEAAAAwEMEAAAAPEQAAADAQwQAAAA8RAAAAMBDBAAAADxEAAAAwEMEAAAAPEQAAADAQwQAAAA8RAAAAMBDBAAAADxEAAAAwEMEAAAAPEQAAADAQwQAAAA8RAAAAMBDBAAAADxEAAAAwEMEAAAAPEQAAADAQwQAAAA8RAAAAMBDBAAAADxEAAAAwEMEAAAAPEQAAADAQwQAAAA8RAAAAMBDBAAAADxEAAAAwEMEAAAAPEQAAADAQwQAAAA8RAAAAMBDBAAAADxEAAAAwEMEAAAAPEQAAADAQwQAAAA8RAAAAMBDBAAAADxEAAAAwEMEAAAAPEQAAADAQ3EXRe5/YrMKC4yLUhiEXlvbEXULwIDyzIstWt/cGXUb6Kc6u6yTOk4CwK+f3uaiDABAUsOyVjUsa426DQxyPAIAAMBDBAAAADxEAAAAwEMEAAAAPEQAAADAQwQAAAA8RAAAAMBDgaRM1E0AAIC86g4ksd0UAAB+6SAAAADgn45AUnvUXQAAgLxKB5K2Rt0FAADIq+ZAUnPUXQAAgLwiAAAA4BtrbXNgjFkfdSMAACB/jDHr49baVdkWKisOdMmZlS56wiD02toOzjYHDkOiukzvGlsUdRvop373zHa1psNsy6yKS8o6ALR3Wn3ighEqK2ZjQezv8fnbCQDAYTjzlApdfAY/qrC/1nSoXz21Les6xpjXA2vta9kWCkOrFatZTQgAQC4tX5VWGNqs61hr/x5UVVUtl9SVbbFlq9JZNwQAAA5u6RttWdew1nZ0d3evDObMmdNhjFmRbcFlq7gDAABALi17I/sf28aYVxobG7v2PLRfkm3BxSvblMl6TgIAADiQrm6rpa87+bH9kvSP44BT2VZraQv14qtM9AIAIBf+9mqbWtqcHOC7UNodAKy1z7mo+OySXS7KAACAfcxf3OKslLQ7AJSUlCyWlPXV+7klu2Szn5wIAAD2Yq303FInP7J3jhs37mVpdwCYN29et7V2frZVN27t0vImVgMAAODSy2+0a/O27qzrWGv/Onv27Iz0jzkAMsbMzbqypMef3e6iDAAA2O3x+W6urUEQzHn733v+Ya2dc+CPH56nFu3QTjeTFAAA8N6O1oz+8vxOJ7UymcyTe/79dgBoaGh4VdKr2Rbv6LKaW78j2zIAAEDSnPod6ux2MsHu5UWLFr2+5499N+9/xMUIv5u/XQ52KgQAwGuhlR57xtmj9Yf3/uMdASCTyTwsB9Zs7NSfGrgLAABANuYu3KH1zZ1OagVBMPsdf+/9x/PPP7/UGLPUxUD3P7FF3RluAwAA0Bdd3VY//UOzq3Iv1NfXL9/7hf3O77XW/sTFSOubO/XEAu4CAADQF/8zf7s2bMn6rL499ru27xcAgiD4mSQni/kfmNOs9g4OCAAA4HC0dYR68Mkt7sp1dDy074v7BYD6+vqtkmbv+3pfNG/v1k9+7+z2BQAAXvjR7zZry47sN/7Z7ZEXX3xxv5mE+wWA3W6T5OQB/q+f3ubq9CIAAAa9V1an9du/bnNWLwzDuw70+gEDQCqVWiLpaTcDW93+yw1MCAQAoAeZULrtoQ0ul9I/uWjRohcP9MbB7gAoCIJbXY3+93UdenCus2cZAAAMSvc/sVkr17g7U8cYc9vB3jtoAKivr5+r3WcGu/DAnC1qWNbqqhwAAINK4/JW/dztj+XnFi5c+NTB3jxoANjtG666CEOrf79vvTZudbakAQCAQWHTti596771TnfRNcb826HeP2QASKVSf5KjuQCStLMto2/dt15dbvY0BgBgwOvqtvrGj9Zp+y6nB+n9aeHChfMO9YGe7gAoDMMbJDnraunr7frOz95UyGEBAADPhaHVt3+6XstWuXvur7eu2Tf19KEeA8CiRYtetNbe76Sl3f78/E7d9chGlyUBABhw7v7NJj39QovrsvfuXs13SD0GAEmKx+Nfl7Q165b28ttntrMyAADgrfufaNavn3a33n+35u7u7m/25oO9CgALFizYpF7cTjhcP3p8s37xR0IAAMAvD87dovufyMlOuTc0Njb2qnCvAoAkpVKpn0r6U59bOoh7H9usux7ZyJwAAMCgZ630g0c36UePb85F+b+kUqmf9/bDvQ4Akqwx5lpJzo/4+828bfrPn29QhnODAACDVCaUvvvgm/rVU06fqO+xPRaLfUaHsY3/4QQALVy4cJWkLx5uV70xZ+EOfeXuNa6XQQAAELntuzK66e4mzVno/Df0Hv+8YMGC1YfzhcMKAJKUSqV+bozZ71hBF55f3qprblmlV1Y7XQ4BAEBkXn6jXdfcskqNy9tyNcTPUqnUrw73S4cdACSpuLj4c5KW9eW7Pdm0rUtfvH21fvvMdlmmBQAABihrpUfnbdOX7mjSpm252QXXGLO0vb398335bp8CwLx583ZZaz+oHMwHkN7aFemOX23QdXc2ac3GzlwMAQBAzrzZ3KUb/qtJdz6yMZe737YYY2YtWbKkTwft9CkASFJDQ8OrxpirJOVs6t6LK9t09S2r9MiftzrdHxkAgFwIrfSrp7bqk99+I5e3/CUpY629sr6+fnlfC/Q5AEjSwoULH5d0QzY1epLuDHX3bzbps7e8wWmCAIB+q2FZqz773VX6waOblO7M7bI2a+31DQ0Nv8+mRjzbJlKp1F3JZPIYSV/KttahrFzboZvuXqNTjyvVtZeM1AkTS3I5HAAAvbL09Xb98Heb9OLK9nwNeWdDQ8Pd2RbJOgBIUiqV+nIikagyxnzMRb1D+durbfrnW1er9oRyXXb2ME2bUiZjcj0qAAD/EIZWzy9v0yN/2Zrvu9MPplKpG10UchIAJIXjx4//5OrVqwuMMZc7qnlIC1/epYUv79KYkQX6wOnD9IEzKlVRmtUTDQAADqmtI9RTi3bq109v06o3O/I9/GMlJSWfkaO5d64CgGbPnp2prq7+REVFRZGkS1zV7cm6zV2657FNuv+JzUpUl+vMU8o148RyVZTG8tUCAGAQa2kL9dySFj2zuEUNL7eqM3ez+g/lsZaWlo+kUqluVwWdBQBJWrZsWWdNTc2seDz+gKQrXNbuSUeX1bOLW/Ts4hYVxI1OPa5Upx1XphOOKdbk8SUqKuA5AQCgZx1dVq+satfLb7TrhRVt+turberORLcUzVr7i9LS0k+5vPhLjgOAJDU2NnbNmjXrE01NTS2SrnVdvze6uq0alrW+/VymIG503NHFmjS2SGOOKNToEQUaM7JQR1UVqKSIxwYA4KP2jlDrm7u0bnOn1jd3aX1zl1auSWtFUzrSC/7erLX/3dDQ8EXlYMl9Tn8WJ5PJr0r6Tq7HyUZgpLKSQKXFMRUXGhUXEghc274ro41bs9sFq6I00OgRhY46AnJnfXOnWtqy+3/1qOEFqiznMaZr6c5Q6U6rtnRGre1hf99fJrTWfq2hoeF7uRog5xfm2traj1hr75fEuj0AAHrWZq39VENDw+xcDpKXX+aJROJkY8yjko7Jx3gAAAxQr0n6cCqVWpLrgfJyv7uhoWFxEATTJP0hH+MBADDQWGv/p6CgIJGPi7+U/2fzJplMflbSHZJK8zw2AAD9UVrSV1Op1Pcl5W1mQiST86ZOnfruIAh+Zow5NYrxAQDoJ14Iw/CqRYsWvZzvgSOZZrp+/fpNkyZN+uZOBaMAAAKpSURBVEl3d/dWSTMlMb0bAOCTdmPMd1paWj61ePHiDVE0EPnyvGQyOUnSnZLeF3UvAADkmjHm90EQXL9gwYK/R9pHlIPvrba29hxJd1hr3x11LwAA5MAKa+2NDQ0NT0TdiNSPAsBuQSKR+LCkW4wxx0bdDAAA2TLGNFlr/09JScl98+bNc7qdbzb6WwCQJFVXVxcOGTLkamvtTWLvAADAwPSapFu7u7vvb2xszG471BzolwFgj1mzZsWampo+KOlGSbVR9wMAQC/US7o9lUr9VjnYw9+Vfh0A9pZMJquttVcZY66RVBV1PwAA7GWHpIeDILinvr7+b1E30xsDJgDsMX369JJMJvN+Y8xH9NbKAc4YAABEoc0Y84S19uEgCP5QX1/fHnVDh2PABYC91dXVlbe3t59vrb3AGHOBpLFR9wQAGNTWSJprjJlbXFz8x3nz5u2KuqG+GtABYF/JZLLaGDND0hnW2umS3qU8nXcAABh0QkkrJdVba+fHYrHn6uvrl0fdlCuDKgDs66STTiorKys7wVp7kqRJkiZaaydKGqe35hFw4DYA+C0jaYukJmPMG5LekLQyk8ks7ujoWLZkyZLWaNvLnUEdAHqSSCSqwjAcEYvFyiXJWjs0CALuGADAIBSGYWiM2SFJ1tqWWCzWXF9fvzXqvgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAb/v/e/Z/AbT8OsIAAAAASUVORK5CYII="
                    />
                  </defs>
                </svg> */}
                {/* <div className={styles.cardWifi}>
                  <span />
                  <span />
                  <span />
                </div> */}
                <WiFiCard />
                <div className={styles.cardNumber}>4085 9536 8475 9530</div>
                <div className={styles.wrapper}>
                  <div className={styles.cardHolder}>Cardholder</div>
                  {/* <svg
                    width="41"
                    height="23"
                    viewBox="0 0 41 23"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M28.0352 22.9935C34.775 22.9935 40.2387 17.8463 40.2387 11.4968C40.2387 5.14728 34.775 0 28.0352 0C25.0146 0 22.2503 1.03387 20.1193 2.74647C17.9883 1.03391 15.2241 7.41641e-05 12.2035 7.41641e-05C5.46371 7.41641e-05 0 5.14735 0 11.4968C0 17.8463 5.46371 22.9936 12.2035 22.9936C15.2241 22.9936 17.9884 21.9597 20.1194 20.2471C22.2504 21.9597 25.0146 22.9935 28.0352 22.9935Z"
                      fill="#FF0006"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M20.1194 20.2469C22.7432 18.1382 24.4069 15.0005 24.4069 11.4968C24.4069 7.99299 22.7432 4.85529 20.1194 2.74658C22.2504 1.03391 25.0147 0 28.0354 0C34.7752 0 40.2389 5.14728 40.2389 11.4968C40.2389 17.8463 34.7752 22.9935 28.0354 22.9935C25.0147 22.9935 22.2504 21.9596 20.1194 20.2469Z"
                      fill="#F9A000"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M20.1196 20.2465C22.7434 18.1378 24.4071 15.0001 24.4071 11.4963C24.4071 7.99251 22.7434 4.85481 20.1196 2.74609C17.4958 4.85481 15.832 7.99251 15.832 11.4963C15.832 15.0001 17.4958 18.1378 20.1196 20.2465Z"
                      fill="#FF5E00"
                    />
                  </svg> */}
                  <MastercardIcon />
                </div>

                {/* <div className={styles.masterLogo}>
                  <div className={styles.masterCircle1} />
                  <div className={styles.masterCircle2} />
                </div> */}
              </div>

              <div className={styles.paymentForm}>
                <input
                  className={styles.payInput}
                  placeholder={t('checkout.payment.cardholder')}
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />

                <input
                  className={styles.payInput}
                  placeholder={t('checkout.payment.cardNumber')}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />

                <div className={styles.payRow}>
                  <input
                    className={styles.payInput}
                    placeholder={t('checkout.payment.expDate')}
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                  />

                  <input
                    className={styles.payInput}
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.billingAddressSection}>
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={sameAsBilling}
                  onChange={(e) => setSameAsBilling(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>{t('checkout.payment.sameAsBilling')}</span>
              </label>
            </div>
          </>
        )}
        <div className={styles.navButtons}>
          <button className={styles.btnBack} onClick={onBack}>
            {t('checkout.payment.back')}
          </button>
          <button className={styles.btnNext} onClick={onNext}>
            {t('checkout.payment.pay')}
          </button>
        </div>
      </div>
    </div>
  );
}

function NavButtons({
  step,
  onBack,
  onNext,
}: {
  step: number;
  onBack: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation('common');

  return (
    <div
      className={`${styles.navButtons} ${step === 2 ? styles.navButtonsPayment : ""}`}
    >
      {" "}
      <button className={styles.btnBack} onClick={onBack}>
        {t('checkout.buttons.back')}
      </button>
      <button className={styles.btnNext} onClick={onNext}>
        {step === 2 ? `${t('checkout.payment.pay')}` : `${t('checkout.buttons.next')}`}
      </button>
    </div>
  );
}

export default function CheckoutFlow() {
  const { t } = useTranslation('common');

  const queryClient = useQueryClient();
  const router = useRouter();
  const [cookies] = useCookies(["token"]);
  const isAuth = useAuth();

  const { isLoaded: mapsLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyDL9J82iDhcUWdQiuIvBYa0t5asrtz3Swk",
    libraries: GOOGLE_LIBRARIES,
  });
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedShipment, setSelectedShipment] = useState("free");
  const [localBaskets, setLocalBaskets] = useState<any[]>([]);

  const steps = [t("checkout.steps.address"), t("checkout.steps.shipping"), t("checkout.steps.payment")];


  const { data: baskets } = useQuery({
    queryKey: ["getAllBaskets"],
    queryFn: () =>
      getAllBaskets(
        qs.stringify({ queryMeta: { paginate: true } }),
        cookies.token,
      ),
    enabled: !!isAuth && !!cookies.token,
    retry: false,
  });

  const { data: deliveryAddresses } = useQuery({
    queryKey: ["getDeliveryAddresses"],
    queryFn: () =>
      getDeliveryAddressApi(
        qs.stringify({
          attributeMeta: {
            exclude: ["lng", "lat", "userUuid", "updatedAt", "deletedAt"],
          },
        }),
        cookies.token,
      ),
    enabled: !!isAuth && !!cookies.token,
    retry: false,
  });

  React.useEffect(() => {
    const first = deliveryAddresses?.data?.[0]?.uuid;
    if (first && !selectedAddress) setSelectedAddress(first);
  }, [deliveryAddresses]);

  React.useEffect(() => {
    if (!isAuth) {
      getBasketItems().then(setLocalBaskets).catch(console.error);
    }
  }, [isAuth]);

  const currentBaskets = isAuth
    ? baskets
    : { data: localBaskets, meta: { count: localBaskets.length } };

  const addresses: Address[] = useMemo(() => {
    if (!deliveryAddresses?.data) {
      // Моковые данные для точного соответствия скрину, если бэкенд пуст
      return [
        {
          uuid: "1",
          label: "2118 Thornridge",
          tag: "HOME",
          street:
            "2118 Thornridge Cir. Syracuse, Connecticut 35624\n(209) 555-0104",
          phone: "(209) 555-0104",
        },
        {
          uuid: "2",
          label: "Headoffice",
          tag: "OFFICE",
          street: "2715 Ash Dr. San Jose, South Dakota 83475\n(704) 555-0127",
          phone: "(704) 555-0127",
        },
      ];
    }
    return deliveryAddresses.data.map((a: any) => ({
      uuid: a.uuid,
      label: a.address?.split(',')?.[0]?.trim() || t('checkout.form.myAddress'),
      tag: "HOME",
      street: a.address ?? "",
      phone: "",
    }));
  }, [deliveryAddresses]);

  const basketItems: CheckoutItem[] = useMemo(() => {
    if (!currentBaskets?.data || currentBaskets.data.length === 0) {
      // Моки под Step 3 со скриншота
      return [
        { uuid: "1", name: "Apple iPhone 14 Pro Max 128GB", price: 1399 },
        { uuid: "2", name: "AirPods Max Silver", price: 549 },
        { uuid: "3", name: "Apple Watch Series 9 GPS 41mm", price: 399 },
      ];
    }
    return currentBaskets.data.map((item: BasketDataItem, index: number) => {
      const images =
        item?.catalog?.images?.length > 0
          ? item.catalog.images.map(({ image }: any) => ({
            imgPath: process.env.NEXT_PUBLIC_BASE_URL + image,
          }))
          : [{ imgPath: "/images/cardEmpty.png" }];

      const imgSrc = images?.[0]?.imgPath || "/images/cardEmpty.png";

      return {
        uuid: (item as any).uuid ?? String(index),
        name: getLoc((item as any).catalog?.name) || "Product",
        price: Number((item as any).catalog?.price) || 0,
        image: imgSrc,
      };
    });
  }, [currentBaskets?.data]);

  const TAX_RATE = 0.021;
  const SHIPPING = 29;
  const subtotal = useMemo(
    () => basketItems.reduce((sum, item) => sum + item.price, 0),
    [basketItems],
  );
  const tax = 50; // Жестко под макет или Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax + SHIPPING;

  const currentAddr = addresses.find((a) => a.uuid === selectedAddress);
  const addressString = currentAddr ? currentAddr.street.split("\n")[0] : "";

  const handleBack = () => {
    if (step === 0) router.push("/basket");
    else setStep((s) => s - 1);
  };

  const handleNext = () => {
    if (step < 2) setStep((s) => s + 1);
  };

  const handlePaymentSuccess = async (result: any) => {
    showToast("Payment successful!", "success");
    await queryClient.invalidateQueries({ queryKey: ["getAllBaskets"] });
    setTimeout(() => {
      router.push(`/myorders/delivery?paymentSuccess=true`);
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    showToast(error || "Payment error", "error");
  };

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.checkoutInner}>
        <StepIndicator current={step} steps={steps} />
        <div className={styles.checkoutBody}>
          {step === 0 && (
            <AddressStep
              addresses={addresses}
              selected={selectedAddress || "1"}
              onSelect={setSelectedAddress}
              token={cookies.token}
              isLoaded={mapsLoaded}
            />
          )}
          {step === 1 && (
            <ShippingStep
              selected={selectedShipment}
              onSelect={setSelectedShipment}
            />
          )}
          {step === 2 && (
            <PaymentStep
              items={basketItems}
              subtotal={subtotal}
              tax={tax}
              shippingCost={SHIPPING}
              total={total}
              address={addressString}
              shipmentMethod={selectedShipment}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}
        </div>
        {step !== 2 && (
          <NavButtons step={step} onBack={handleBack} onNext={handleNext} />
        )}{" "}
      </div>
    </div>
  );
}
