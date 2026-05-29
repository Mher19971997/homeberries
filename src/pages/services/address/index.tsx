import React from 'react';
import * as qs from 'qs';
import { Box, Typography, Button } from '@mui/material';
import GoogleMapComponent from '@homeberris/components/GoogleMapComponent';
import {
  getCompanyAddressesPublic
} from '@homeberris/http/companyAddressApi';
import CompanyAddressItem from '@homeberris/components/CompanyAddressItem';
import styles from '@homeberris/pages/services/address/index.module.css';
import { CompanyAddressData } from '@homeberris/http/companyAddressApi';
import { useLoadScript } from '@react-google-maps/api';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default function AddressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { data: companyAddressesResponse } = useQuery<{ data: CompanyAddressData[] }>({
    queryKey: ['getCompanyAddressesPublic'],
    queryFn: () => getCompanyAddressesPublic(),
  });

  const companyAddresses = companyAddressesResponse?.data || [];

  const { t } = useTranslation('common');
  const [selectedAddress, setSelectedAddress] = React.useState<CompanyAddressData | null>(null);
  const [markers, setMarkers] = React.useState<any>([]);
  const [selected, setSelected] = React.useState<any>(null);
  // getDeliveryAddressApi
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDL9J82iDhcUWdQiuIvBYa0t5asrtz3Swk',
    libraries: ['places']
  });

  const mapRef = React.useRef<any>(null);

  // Инициализация маркеров из адресов компаний
  React.useEffect(() => {
    if (companyAddresses.length > 0) {
      const initialMarkers = companyAddresses.map((addr) => ({
        lat: addr.latitude,
        lng: addr.longitude,
        address: addr.address,
        companyName: addr.company?.name,
        companyDescription: addr.company?.description,
        companyUuid: addr.companyUuid,
        uuid: addr.uuid,
      }));
      setMarkers(initialMarkers);
    }
  }, [companyAddresses]);

  const onMapLoad = React.useCallback((map: any) => {
    mapRef.current = map;
    // Центрируем карту на всех адресах при первой загрузке
    if (companyAddresses.length > 0 && typeof window !== 'undefined' && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      companyAddresses.forEach((addr) => {
        bounds.extend(new window.google.maps.LatLng(addr.latitude, addr.longitude));
      });
      map.fitBounds(bounds);
    }
  }, [companyAddresses]);

  const panTo = React.useCallback(
    ({ lat, lng }: { lat: string | number; lng: string | number }) => {
      if (!mapRef.current) return;

      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(14);
    },
    []
  );

  const idFromQuery = searchParams?.get('id');

  // Если есть id в query, автоматически выбираем этот пункт и фокусируем карту
  React.useEffect(() => {
    if (!companyAddresses.length || !idFromQuery) return;

    const found = companyAddresses.find((item) => item.uuid === idFromQuery);
    if (found) {
      setSelectedAddress(found);
      try {
        panTo({ lat: found.latitude, lng: found.longitude });
      } catch (e) {
        // ignore
      }
    }
  }, [companyAddresses, idFromQuery, panTo]);

  const handleSelect = async (address: CompanyAddressData) => {
    try {
      panTo({ lat: address.latitude, lng: address.longitude });
      if (address.uuid) {
        router.push(`${pathname}?id=${address.uuid}`);
      }
    } catch (error) {
      console.log('😱 Error: ', error);
    }
  };

  const handleCompanyClick = (companyUuid: string) => {
    router.push(`/company/${companyUuid}`);
  };

  const handleMarkerClick = (marker: any) => {
    const address = companyAddresses.find((addr) => addr.uuid === marker.uuid);
    if (address) {
      setSelectedAddress(address);
      panTo({ lat: address.latitude, lng: address.longitude });
      if (address.uuid) {
        router.push(`${pathname}?id=${address.uuid}`);
      }
    }
    setSelected(marker);
  };

  return (
    <Box className={styles.body}>
      <Box className={styles.container}>
        <Typography variant='h4' fontWeight={'bold'} className={styles.title}>
          {t('addresses.title')}
        </Typography>
        <Box className={styles.mapBox}>
          <Box className={styles.locatiponBlock}>
            {!selectedAddress && (
              <>
                <Typography className={styles.listTitle}>{t('addresses.listTitle')}</Typography>
                {companyAddresses.map((item: CompanyAddressData, index: number) => (
                  <CompanyAddressItem
                    key={item.uuid || index}
                    item={item}
                    selectedAddress={selectedAddress}
                    handleSelect={handleSelect}
                    setSelectedAddress={setSelectedAddress}
                  />
                ))}
              </>
            )}
            {selectedAddress && (
              <Box className={styles.detailsPanel}>
                <Typography
                  variant='body2'
                  color='primary'
                  sx={{ cursor: 'pointer', mb: 1 }}
                  onClick={() => {
                    setSelectedAddress(null);
                    router.push(pathname ?? '/services/address');
                  }}
                >
                  {t('addresses.back')}
                </Typography>
                <Typography variant='h6' fontWeight='bold' mb={1}>
                  {selectedAddress.company?.name || `${t('addresses.company')}`}
                </Typography>
                <Typography variant='subtitle2' color='text.secondary' mb={2}>
                  {selectedAddress.address}
                </Typography>
                {selectedAddress.company?.description && (
                  <Typography variant='body2' color='text.secondary' mb={2}>
                    {selectedAddress.company.description}
                  </Typography>
                )}
                {selectedAddress.companyUuid && (
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={() => handleCompanyClick(selectedAddress.companyUuid!)}
                    sx={{ mt: 2 }}
                  >
                    {t('addresses.button')}
                  </Button>
                )}
              </Box>
            )}
          </Box>
          <Box className={styles.map}>
            <GoogleMapComponent
              mutate={null}
              panTo={panTo}
              onMapLoad={onMapLoad}
              selected={selected}
              setSelected={handleMarkerClick}
              onMapClick={null}
              selectedAddress={selectedAddress ? {
                lat: selectedAddress.latitude.toString(),
                lng: selectedAddress.longitude.toString(),
                address: selectedAddress.address,
              } : null}
              isLoaded={isLoaded}
              loadError={loadError}
              markers={markers}
              readOnly={true}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

