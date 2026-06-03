'use client';
import React, { useState, useMemo } from 'react';
import styles from './index.module.css';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllBaskets } from '@homeberris/http/basketApi';
import { getDeliveryAddressApi } from '@homeberris/http/deliveryAddressApi';
import qs from 'qs';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation';
import { useAuth } from '@homeberris/hooks/useAuth';
import { useToast } from '@homeberris/hooks/useToast';
import { getBasketItems } from '@homeberris/utils/indexedDB';
import { BasketDataItem } from '@homeberris/types/basket';
import SelectPaymentMethod from '@homeberris/components/SelectPaymentMethod';
import { AddAddressIcon, EditIcon, LocationIcon, PaymentIcon, ShippingIcon } from '@homeberris/assets/icons/order';

interface Address {
  uuid: string;
  label: string;
  tag: 'HOME' | 'OFFICE' | string;
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

const STEPS = ['Address', 'Shipping', 'Payment'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className={styles.stepIndicator}>
      {STEPS.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'pending';
        return (
          <React.Fragment key={label}>
            <div className={`${styles.step} ${styles[state]}`}>
              <div className={styles.stepCircle}>
                {React.createElement(STEP_ICONS[i], {
                  className: styles.stepIcon,
                })}
              </div>
              <div className={styles.stepMeta}>
                <span>Step {i + 1}</span>
                <span>{label}</span>
              </div>
            </div>
            {i < STEPS.length - 1}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function AddressStep({
  addresses,
  selected,
  onSelect,
}: {
  addresses: Address[];
  selected: string;
  onSelect: (uuid: string) => void;
}) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.addressList}>
        <h2 className={styles.sectionTitle}>Select Address</h2>
        {addresses.map((addr) => (
          <label
            key={addr.uuid}
            className={`${styles.addressCard} ${selected === addr.uuid ? styles.addressCardSelected : ''}`}
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
              {addr.street.split('\n').map((line, i) => (
                <p key={i} className={styles.addressLine}>{line}</p>
              ))}
            </div>
            <div className={styles.addressActions}>
              <button className={styles.iconBtn} title="Edit" onClick={(e) => e.preventDefault()}>
                <EditIcon />
              </button>
              <button className={styles.iconBtn} title="Delete" onClick={(e) => e.preventDefault()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </label>
        ))}
        <button className={styles.addAddressBtn}>
          <span className={styles.addIcon}><AddAddressIcon /></span>
          Add New Address
        </button>
      </div>
    </div>
  );
}

const SHIPMENT_METHODS: ShipmentMethod[] = [
  { id: 'free', label: 'Free', description: 'Regulary shipment', price: null, date: '17 Oct, 2023' },
  { id: 'fast', label: '$8.50', description: 'Get your delivery as soon as possible', price: 8.5, date: '1 Oct, 2023' },
  { id: 'schedule', label: 'Schedule', description: 'Pick a date when you want to get your delivery', price: null, date: null },
];

const STEP_ICONS = [LocationIcon, ShippingIcon, PaymentIcon];

function ShippingStep({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.shipmentList}>
        <h2 className={styles.sectionTitle}>Shipment Method</h2>
        {SHIPMENT_METHODS.map((method) => (
          <label
            key={method.id}
            className={`${styles.shipmentCard} ${selected === method.id ? styles.shipmentCardSelected : ''}`}
          >
            <input
              type="radio"
              name="shipment"
              value={method.id}
              checked={selected === method.id}
              onChange={() => onSelect(method.id)}
              className={styles.radioHidden}
            />
            <div className={styles.radioCircle}>
              {selected === method.id && <div className={styles.radioInner} />}
            </div>
            <div className={styles.shipmentBody}>
              <span className={styles.shipmentLabel}>{method.label}</span>
              <span className={styles.shipmentDesc}>{method.description}</span>
            </div>
            <div className={styles.shipmentDate}>
              {method.date ? (
                <span>{method.date}</span>
              ) : (
                <span className={styles.selectDate}>
                  Select Date
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

type PaymentTab = 'Credit Card' | 'PayPal' | 'PayPal Credit';

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
  const [tab, setTab] = useState<PaymentTab>('Credit Card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [showStripe, setShowStripe] = useState(false);

  const fmt = (n: number) => `$${n}`;
  const TABS: PaymentTab[] = ['Credit Card', 'PayPal', 'PayPal Credit'];
  const shipLabel = shipmentMethod === 'free' ? 'Free' : shipmentMethod === 'fast' ? '$8.50' : 'Scheduled';

  return (
    <div className={styles.paymentLayout}>
      {/* Summary Panel (Слева) */}
      <div className={styles.summaryPanel}>
        <div className={styles.summary}>
          <h3 className={styles.summaryPanelTitle}>Summary</h3>
        </div>
        <div className={styles.summaryItems}>
          {items.map((item, i) => (
            <div key={item.uuid ?? i} className={styles.summaryItem}>
              {item.image && <img src={item.image} alt={item.name} className={styles.summaryItemImg} />}
              <span className={styles.summaryItemName}>{item.name}</span>
              <span className={styles.summaryItemPrice}>{fmt(item.price)}</span>
            </div>
          ))}
        </div>
        <div className={styles.details}>
          <div className={styles.addressDetails}>
            <div className={styles.summaryMeta}>
              <p className={styles.summaryMetaLabel}>Address</p>
              <p className={styles.summaryMetaValue}>{address || '1131 Dusty Townline, Jacksonville, TX 40322'}</p>
            </div>
            <div className={styles.summaryMeta}>
              <p className={styles.summaryMetaLabel}>Shipment method</p>
              <p className={styles.summaryMetaValue}>{shipLabel}</p>
            </div>
          </div>
          <div className={styles.summaryTotals}>
            <div className={styles.summaryTotalRow}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className={styles.taxes}>
              <div className={`${styles.summaryTotalRow} ${styles.muted}`}><span>Estimated Tax</span><span>{fmt(tax)}</span></div>
              <div className={`${styles.summaryTotalRow} ${styles.muted}`}><span>Estimated shipping &amp; Handling</span><span>{fmt(shippingCost)}</span></div>
            </div>
            <div className={`${styles.summaryTotalRow} ${styles.totalRow}`}><span>Total</span><span>{fmt(total)}</span></div>
          </div>
        </div>
      </div>

      {/* Payment Form Panel (Справа) */}
      <div className={styles.paymentPanel}>
        <div className={styles.paymentSection}>
          <h2 className={styles.sectionTitle}>Payment</h2>
          <div className={styles.paymentTabs}>
            {TABS.map((t) => (
              <button
                key={t}
                className={`${styles.paymentTab} ${tab === t ? styles.paymentTabActive : ''}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        {tab === 'Credit Card' && !showStripe && (
          <div className={styles.cardDetails}>
            <div className={styles.cardVisual}>
              <div className={styles.cardChip}>
                <div className={styles.chipLineH} />
                <div className={styles.chipLineV} />
                <div className={styles.chipInner} />
              </div>

              <div className={styles.cardWifi}>
                <span />
                <span />
                <span />
              </div>

              <div className={styles.cardNumber}>4085 9536 8475 9530</div>
              <div className={styles.cardHolder}>Cardholder</div>

              <div className={styles.masterLogo}>
                <div className={styles.masterCircle1} />
                <div className={styles.masterCircle2} />
              </div>
            </div>
            <div className={styles.paymentForm}>
              <input className={styles.payInput} placeholder="Cardholder Name" value={cardName} onChange={(e) => setCardName(e.target.value)} />
              <input className={styles.payInput} placeholder="Card Number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
              <div className={styles.payRow}>
                <input className={styles.payInput} placeholder="Exp. Date" value={expDate} onChange={(e) => setExpDate(e.target.value)} />
                <input className={styles.payInput} placeholder="CVV" value={cvv} onChange={(e) => setCvv(e.target.value)} />
              </div>
              </div>
              <label className={styles.checkboxRow}>
                <input type="checkbox" checked={sameAsBilling} onChange={(e) => setSameAsBilling(e.target.checked)} className={styles.checkbox} />
                <span>Same as billing address</span>
              </label>
            </div>
        )}
        {tab === 'Credit Card' && showStripe && (
          <SelectPaymentMethod
            amount={total * 100}
            open={true}
            onClose={() => setShowStripe(false)}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
          />
        )}
        {tab !== 'Credit Card' && (
          <div className={styles.altPayment}>
            <p>Redirect to {tab} to complete payment.</p>
          </div>
        )}
        <div className={styles.navButtons}>
          <button className={styles.btnBack} onClick={onBack}>Back</button>
          <button className={styles.btnNext} onClick={onNext}>Pay</button>
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
  return (
    <div className={`${styles.navButtons} ${step === 2 ? styles.navButtonsPayment : ''}`}>      <button className={styles.btnBack} onClick={onBack}>Back</button>
      <button className={styles.btnNext} onClick={onNext}>
        {step === 2 ? 'Pay' : 'Next'}
      </button>
    </div>
  );
}

export default function CheckoutFlow() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [cookies] = useCookies(['token']);
  const isAuth = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedShipment, setSelectedShipment] = useState('free');
  const [localBaskets, setLocalBaskets] = useState<any[]>([]);

  const { data: baskets } = useQuery({
    queryKey: ['getAllBaskets'],
    queryFn: () => getAllBaskets(qs.stringify({ queryMeta: { paginate: true } }), cookies.token),
    enabled: !!isAuth && !!cookies.token,
    retry: false,
  });

  const { data: deliveryAddresses } = useQuery({
    queryKey: ['getDeliveryAddresses'],
    queryFn: () => getDeliveryAddressApi(qs.stringify({ attributeMeta: { exclude: ['lng', 'lat', 'userUuid', 'updatedAt', 'deletedAt'] } }), cookies.token),
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

  const currentBaskets = isAuth ? baskets : { data: localBaskets, meta: { count: localBaskets.length } };

  const addresses: Address[] = useMemo(() => {
    if (!deliveryAddresses?.data) {
      // Моковые данные для точного соответствия скрину, если бэкенд пуст
      return [
        { uuid: '1', label: '2118 Thornridge', tag: 'HOME', street: '2118 Thornridge Cir. Syracuse, Connecticut 35624\n(209) 555-0104', phone: '(209) 555-0104' },
        { uuid: '2', label: 'Headoffice', tag: 'OFFICE', street: '2715 Ash Dr. San Jose, South Dakota 83475\n(704) 555-0127', phone: '(704) 555-0127' }
      ];
    }
    return deliveryAddresses.data.map((a: any) => ({
      uuid: a.uuid,
      label: a.name ?? a.city ?? 'Address',
      tag: a.type ?? 'HOME',
      street: `${a.street ?? ''}, ${a.city ?? ''}, ${a.country ?? ''}\n${a.phone ?? ''}`,
      phone: a.phone ?? '',
    }));
  }, [deliveryAddresses]);

  const basketItems: CheckoutItem[] = useMemo(() => {
    if (!currentBaskets?.data || currentBaskets.data.length === 0) {
      // Моки под Step 3 со скриншота
      return [
        { uuid: '1', name: 'Apple iPhone 14 Pro Max 128GB', price: 1399 },
        { uuid: '2', name: 'AirPods Max Silver', price: 549 },
        { uuid: '3', name: 'Apple Watch Series 9 GPS 41mm', price: 399 }
      ];
    }
    return currentBaskets.data.map((item: BasketDataItem, index: number) => {
      const images =
        item?.catalog?.images?.length > 0
          ? item.catalog.images.map(({ image }: any) => ({
            imgPath: process.env.NEXT_PUBLIC_BASE_URL + image,
          }))
          : [{ imgPath: '/images/cardEmpty.png' }];

      const imgSrc = images?.[0]?.imgPath || '/images/cardEmpty.png';

      return {
        uuid: (item as any).uuid ?? String(index),
        name: (item as any).catalog?.name ?? 'Product',
        price: Number((item as any).catalog?.price) || 0,
        image: imgSrc,
      };
    });
  }, [currentBaskets?.data]);

  const TAX_RATE = 0.021;
  const SHIPPING = 29;
  const subtotal = useMemo(() => basketItems.reduce((sum, item) => sum + item.price, 0), [basketItems]);
  const tax = 50; // Жестко под макет или Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax + SHIPPING;

  const currentAddr = addresses.find((a) => a.uuid === selectedAddress);
  const addressString = currentAddr ? currentAddr.street.split('\n')[0] : '';

  const handleBack = () => {
    if (step === 0) router.push('/basket');
    else setStep((s) => s - 1);
  };

  const handleNext = () => {
    if (step < 2) setStep((s) => s + 1);
  };

  const handlePaymentSuccess = async (result: any) => {
    showToast('Payment successful!', 'success');
    await queryClient.invalidateQueries({ queryKey: ['getAllBaskets'] });
    setTimeout(() => {
      router.push(`/myorders/delivery?paymentSuccess=true`);
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    showToast(error || 'Payment error', 'error');
  };

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.checkoutInner}>
        <StepIndicator current={step} />
        <div className={styles.checkoutBody}>
          {step === 0 && (
            <AddressStep
              addresses={addresses}
              selected={selectedAddress || '1'}
              onSelect={setSelectedAddress}
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
        )}      </div>
    </div>
  );
}