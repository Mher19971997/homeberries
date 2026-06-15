import React, { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow
} from '@react-google-maps/api';
import { formatRelative } from 'date-fns';
import { Box, Button } from '@mui/material';

import GoogleMapSearchInput from '@homeberris/components/GoogleMapSearchInput';
import GoogleMapLocate from '@homeberris/components/GoogleMapLocate';
import styles from '@homeberris/components/GoogleMapComponent/index.module.css';
import '@reach/combobox/styles.css';
import { deliveryAddressData } from '@homeberris/types/deliveryAddress';
import { getGeocode, getLatLng } from 'use-places-autocomplete';

const libraries = ['places'];
const mapContainerStyle = {
  height: '75vh',
  width: '100%'
};
const options = {
  // styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true
};

interface GoogleMapComponentProps {
  mutate: any;
  selectedAddress: any;
  panTo: any;
  onMapLoad: any;
  selected: any;
  setSelected: any;
  onMapClick: any;
  isLoaded: any;
  loadError: any;
  markers: any;
  readOnly?: boolean;
}

// insertDeliveryAddress
const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  mutate,
  selectedAddress,
  panTo,
  onMapLoad,
  selected,
  setSelected,
  onMapClick,
  isLoaded,
  loadError,
  markers,
  readOnly = false
}) => {
  const { t } = useTranslation('common');
  const center = {
    lat: (selectedAddress && selectedAddress.lat) || 43.6532,
    lng: (selectedAddress && selectedAddress.lng) || -79.3832
  };

  // Кастомный маркер под бренд STYLE BOX (public/images/map-marker-logo.svg)
  const markerIcon = React.useMemo(() => {
    if (typeof window === 'undefined' || !(window as any).google || !isLoaded) {
      return undefined;
    }
    
    try {
      const google = (window as any).google;
      // Используем относительный путь
      const markerUrl = '/images/map-marker-logo.svg';
      
      // Создаем объект иконки маркера с правильными размерами
      const iconConfig: google.maps.Icon = {
        url: markerUrl,
        scaledSize: new google.maps.Size(56, 72), // Размеры из SVG viewBox (56x72)
        anchor: new google.maps.Point(28, 72), // Точка привязки внизу маркера (центр по X, низ по Y)
        origin: new google.maps.Point(0, 0)
      };
      
      return iconConfig;
    } catch (error) {
      console.error('Error creating marker icon:', error);
      return undefined;
    }
  }, [isLoaded]);
  if (loadError) return 'Error';
  if (!isLoaded) return 'Loading...';

  return (
    <Box className={styles.mapMainBlock}>
      {!readOnly && (
        <>
          <GoogleMapLocate panTo={panTo} />
          <GoogleMapSearchInput panTo={panTo} />
        </>
      )}
      <GoogleMap
        id='map'
        mapContainerStyle={mapContainerStyle}
        zoom={markers && markers.length > 0 ? 10 : 8}
        center={center}
        options={options}
        onClick={readOnly ? undefined : onMapClick}
        onLoad={onMapLoad}
      >
        {markers.map((marker: any, index: number) => (
          <Marker
            key={marker.uuid || `${marker.lat}-${marker.lng}-${index}`}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => {
              setSelected(marker);
            }}
            icon={markerIcon}
            title={marker.companyName || marker.address}
          />
        ))}

        {selected ? (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div style={{ minWidth: '200px' }}>
              {selected.companyName ? (
                <>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                    {selected.companyName}
                  </h3>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                    {selected.address}
                  </p>
                  {selected.companyDescription && (
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#888' }}>
                      {selected.companyDescription}
                    </p>
                  )}
                  {selected.companyUuid && (
                    <Box mt={1} className={styles.btnGroup}>
                      <Button
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            window.location.href = `/company/${selected.companyUuid}`;
                          }
                        }}
                        variant='contained'
                        className={styles.btnGroupContained}
                        size="small"
                        fullWidth
                      >
                        {t('googleMap.goToCatalogs')}
                      </Button>
                    </Box>
                  )}
                </>
              ) : !readOnly ? (
                <>
                  <h2>
                    <span role='img' aria-label='bear'>
                      {t('googleMap.addPickupPoint')}
                    </span>
                  </h2>
                  <p>Spotted {selected.time ? formatRelative(selected.time, new Date()) : ''}</p>
                  {mutate && (
                    <Box mt={1} className={styles.btnGroup}>
                      <Button
                        onClick={() =>
                          markers.length !== 0 &&
                          mutate({
                            address: markers[0].address,
                            lat: markers[0].lat,
                            lng: markers[0].lng
                          })
                        }
                        variant='contained'
                        className={styles.btnGroupContained}
                      >
                        {t('googleMap.yes')}
                      </Button>
                    </Box>
                  )}
                </>
              ) : null}
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </Box>
  );
};

export default GoogleMapComponent;
