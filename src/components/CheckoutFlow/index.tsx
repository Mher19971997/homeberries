"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";

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
import {
  AddAddressIcon,
  EditIcon,
  LocationIcon,
  PaymentIcon,
  ShippingIcon,
} from "@homeberris/assets/icons/order";
import WiFiCard from "@homeberris/assets/icons/wifi";
import MastercardIcon from "@homeberris/assets/icons/mastercard";
import { useQueryClient as useQC } from "@tanstack/react-query";
import { useLoadScript } from "@react-google-maps/api";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { createDeliveryAddress, updateDeliveryAddress, deleteDeliveryAddress } from "@homeberris/http/deliveryAddressApi";
import { useTranslation } from "react-i18next";
import CustomModal from "@homeberris/components/CustomModal";
import DatePickerCustom from "@homeberris/components/DatePickerCustom";
import { loadStripe } from "@stripe/stripe-js";
import { Skeleton } from "@mui/material";
import { CardCvcElement, CardExpiryElement, CardNumberElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { confirmPayment, createPaymentIntent } from "@homeberris/http/paymentApi";

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

const getLoc = (val: any, locale = 'en'): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[locale] || val.en || val.ru || '';
};

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
    } catch { }
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
    } catch { } finally {
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
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 11v5M14 11v5" stroke="#000" strokeWidth="1.8" strokeLinecap="round" />
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

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "14px",
      color: "#000",
      fontFamily: "var(--font-inter)",
      "::placeholder": { color: "#cecece" },
    },
    invalid: { color: "#df1b41" },
  },
};

function CardFormSkeleton({ styles }: { styles: any }) {
  return (
    <div className={styles.cardDetails}>
      <Skeleton variant="rounded" width="100%" height={130} sx={{ borderRadius: "12px", marginBottom: "24px" }} />
      <div className={styles.paymentForm}>
        <Skeleton variant="rounded" height={48} />
        <Skeleton variant="rounded" height={48} />
        <div className={styles.payRow}>
          <Skeleton variant="rounded" height={48} width="100%" />
          <Skeleton variant="rounded" height={48} width="100%" />
        </div>
      </div>
    </div>
  );
}

function CreditCardFields({
  clientSecret,
  styles,
  onBack,
  onPaymentSuccess,
  onPaymentError,
}: {
  clientSecret: string;
  styles: any;
  onBack: () => void;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation("common");
  const [cardName, setCardName] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: { name: cardName || undefined },
        },
      });

      if (error) {
        const msg = error.message || t("checkout.payment.errorConfirm");
        setErrorMessage(msg);
        onPaymentError(msg);
        return;
      }

      if (paymentIntent?.status !== "succeeded") {
        const msg = t("checkout.payment.errorNotCompleted", { status: paymentIntent?.status || "unknown" });
        setErrorMessage(msg);
        onPaymentError(msg);
        return;
      }

      const result = await confirmPayment({ paymentIntentId: paymentIntent.id });

      if (result.success) {
        onPaymentSuccess({ ...result, paymentIntentId: paymentIntent.id });
      } else {
        const msg = result.message || t("checkout.payment.errorProcessing");
        setErrorMessage(msg);
        onPaymentError(msg);
      }
    } catch (e: any) {
      const msg = e?.message || t("checkout.payment.errorGeneral");
      setErrorMessage(msg);
      onPaymentError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className={styles.cardDetails}>
        <div className={styles.cardVisual}>
          <WiFiCard />
          <div className={styles.cardNumber}>4085 9536 8475 9530</div>
          <div className={styles.wrapper}>
            <div className={styles.cardHolder}>{cardName || "Cardholder"}</div>
            <MastercardIcon />
          </div>
        </div>

        <div className={styles.paymentForm}>
          <input
            className={styles.payInput}
            placeholder={t('checkout.payment.cardholder')}
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
          />

          <div className={styles.payInput} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "100%" }}>
              <CardNumberElement options={ELEMENT_OPTIONS} />
            </div>
          </div>

          <div className={styles.payRow}>
            <div className={styles.payInput} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: "100%" }}>
                <CardExpiryElement options={ELEMENT_OPTIONS} />
              </div>
            </div>

            <div className={styles.payInput} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: "100%" }}>
                <CardCvcElement options={ELEMENT_OPTIONS} />
              </div>
            </div>
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
          <span>{t("checkout.payment.sameAsBilling")}</span>
        </label>
      </div>

      {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

      <div className={styles.navButtons}>
        <button className={styles.btnBack} onClick={onBack} disabled={isProcessing}>
          {t("checkout.payment.back")}
        </button>
        <button className={styles.btnNext} onClick={handlePay} disabled={!stripe || isProcessing}>
          {isProcessing ? t("checkout.payment.processing") : t("checkout.payment.pay")}
        </button>
      </div>
    </>
  );
}

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
  // onNext,
  promocode
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
  // onNext: () => void;
  promocode?: string
}) {
  const [tab, setTab] = useState<PaymentTab>("Credit Card");
  // const [cardNumber, setCardNumber] = useState("");
  // const [cardName, setCardName] = useState("");
  // const [expDate, setExpDate] = useState("");
  // const [cvv, setCvv] = useState("");
  // const [sameAsBilling, setSameAsBilling] = useState(true);
  // const [showStripe, setShowStripe] = useState(false);
  const { t } = useTranslation('common');

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentError, setIntentError] = useState<string | null>(null);

  const hasRealBasketItems = items.every(
    (item) => !!item.uuid && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.uuid)
  );

  useEffect(() => {
    if (tab !== "Credit Card" || !hasRealBasketItems) return;
    let active = true;
    setClientSecret(null);
    setIntentError(null);

    createPaymentIntent({
      amount: Math.round(total * 100),
      currency: "rub",
      basketUuids: items.map((i) => i.uuid).filter(Boolean) as string[],
      promocode
    })
      .then((res) => {
        if (!active) return;
        setClientSecret(res.clientSecret);
      })
      .catch((err) => {
        if (!active) return;
        setIntentError(err?.message || t("checkout.payment.intentError"));
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, hasRealBasketItems, total, promocode]);

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
        {tab === "Credit Card" ? (
          !hasRealBasketItems ? (
            <p className={styles.errorText}>{t("checkout.payment.basketNotReady")}</p>
          ) : intentError ? (
            <p className={styles.errorText}>{intentError}</p>
          ) : !clientSecret ? (
            <CardFormSkeleton styles={styles} />
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CreditCardFields
                clientSecret={clientSecret}
                styles={styles}
                onBack={onBack}
                onPaymentSuccess={onPaymentSuccess}
                onPaymentError={onPaymentError}
              />
            </Elements>
          )
        ) : (
          <div className={styles.navButtons}>
            <button className={styles.btnBack} onClick={onBack}>
              {t("checkout.payment.back")}
            </button>
          </div>
        )}
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

      // Цена позиции — по выбранному варианту, если он есть, иначе базовая.
      const sv = (item as any)?.selectedVariant;
      const unitPrice = (sv && typeof sv.price === "number")
        ? sv.price
        : (Number((item as any).catalog?.price) || 0);

      return {
        uuid: (item as any).uuid ?? String(index),
        name: getLoc((item as any).catalog?.name) || "Product",
        price: unitPrice,
        image: imgSrc,
      };
    });
  }, [currentBaskets?.data]);

  const TAX_RATE = 0.021;
  const SHIPPING = 29;

  const appliedPromo = queryClient.getQueryData<{ code: string; discountPercent: number }>(['appliedPromo']); // ADD

  const subtotal = useMemo(
    () => basketItems.reduce((sum, item) => sum + item.price, 0),
    [basketItems],
  );
  const discountAmount = Math.round(subtotal * ((appliedPromo?.discountPercent || 0) / 100)); // ADD

  const tax = 50; // Жестко под макет или Math.round(subtotal * TAX_RATE);
  const total = subtotal - discountAmount + tax + SHIPPING;

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
    queryClient.removeQueries({ queryKey: ["appliedPromo"] });
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
              promocode={appliedPromo?.code}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onBack={handleBack}
            // onNext={handleNext}
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
