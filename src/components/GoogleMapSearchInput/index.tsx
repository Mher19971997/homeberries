import React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover
} from '@reach/combobox';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng
} from 'use-places-autocomplete';
import styles from '@homeberris/components/GoogleMapSearchInput/index.module.css';

interface GoogleMapSearchInputProps {
  panTo: any;
}

const GoogleMapSearchInput: React.FC<GoogleMapSearchInputProps> = ({
  panTo
}) => {
  const { t } = useTranslation('common');
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions
  } = usePlacesAutocomplete({
    requestOptions: {
      // Используем any, чтобы удовлетворить тип LatLng от Google Maps без ошибки типов
      location: { lat: () => 43.6532, lng: () => -79.3832 } as any,
      radius: 100 * 1000
    }
  });

  // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompletionRequest

  const handleInput = (e: any) => {
    setValue(e.target.value);
  };

  const handleSelect = async (address: any) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);

      panTo({ lat, lng });
    } catch (error) {
      console.log('😱 Error: ', error);
    }
  };

  const handleClear = () => {
    setValue('');
    clearSuggestions();
  };

  const formatSuggestion = (description: string) => {
    const [first, ...rest] = description.split(',');
    const primary = first.trim();
    const secondary = rest.join(',').trim();

    return { primary, secondary };
  };

  return (
    <Box className={styles.search}>
      <Combobox onSelect={handleSelect}>
        <Box className={styles.searchInner}>
          <Box className={styles.inputWrapper}>
            <ComboboxInput
              className={styles.searchInput}
              value={value}
              onChange={handleInput}
              disabled={!ready}
              placeholder={t('googleMap.searchPlaceholder')}
            />
            {value && (
              <button
                type='button'
                className={styles.clearButton}
                onClick={handleClear}
                aria-label={t('googleMap.clearSearch')}
              >
                ×
              </button>
            )}
          </Box>
          <button
            type='button'
            className={styles.searchButton}
            disabled={!ready || !value}
            onClick={() => value && handleSelect(value)}
          >
            {t('googleMap.find')}
          </button>
        </Box>
        <ComboboxPopover className={styles.popover}>
          <ComboboxList>
            {status === 'OK' &&
              data.map(({ id, description }: any) => {
                const { primary, secondary } = formatSuggestion(description);

                return (
                  <ComboboxOption
                    key={id}
                    value={description}
                    className={styles.option}
                  >
                    <span className={styles.optionPrimary}>{primary}</span>
                    {secondary && (
                      <span className={styles.optionSecondary}>{secondary}</span>
                    )}
                  </ComboboxOption>
                );
              })}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </Box>
  );
};

export default GoogleMapSearchInput;
