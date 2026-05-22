import React from 'react';
import { Box, Button, Typography, Popover, Divider } from '@mui/material';
import CustomModal from '@homeberris/components/CustomModal';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckIcon from '@mui/icons-material/Check';
import styles from '@homeberris/components/CreateAddress/index.module.css';
import { getDeliveryAddressApi } from '@homeberris/http/deliveryAddressApi';
import qs from 'qs';
import DeliveryAddressItemForModal from '../DeliveryAddressItemForModal';
import { useCookies } from 'react-cookie';
import { useQuery } from 'react-query';

interface CreateAddressProps {}

const CreateAddress: React.FC<CreateAddressProps> = () => {
  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [selectedAddress, setSelectedAddress] = React.useState<any>(null);
  const [cookies] = useCookies(['token']);

  const handleClose = () => setOpenModal(false);
  const handlePopoverClose = () => setAnchorEl(null);

  const { data: deliveryAdress } = useQuery(
    ['getDeliveryAddressIsDefault', cookies.token],
    () =>
      getDeliveryAddressApi(
        qs.stringify({
          isDefault: true
        }),
        cookies.token
      ),
    {
      onSuccess: (data) => {
        const defaultAddress = data?.data?.find((item: any) => item.isDefault === true);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        }
      }
    }
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAddressSelect = (address: any) => {
    setSelectedAddress(address);
    setAnchorEl(null);
    // Здесь можно добавить логику сохранения выбранного адреса
  };

  const open = Boolean(anchorEl);
  const id = open ? 'address-popover' : undefined;

  const currentAddress = selectedAddress || deliveryAdress?.data?.find((item: any) => item.isDefault === true);
  const displayAddress = currentAddress?.address || 'Выберите пункт выдачи';

  return (
    <Box>
      <Box
        className={styles.trigger}
        onClick={handleClick}
        aria-describedby={id}
      >
        <LocationOnIcon className={styles.locationIcon} />
        <Typography className={styles.addressText}>
          {displayAddress.length > 30 ? `${displayAddress.substring(0, 30)}...` : displayAddress}
        </Typography>
      </Box>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        PaperProps={{
          className: styles.popoverPaper
        }}
      >
        <Box className={styles.popover}>
          <Typography className={styles.title}>Выберите пункт выдачи</Typography>
          <Divider sx={{ my: 1.5 }} />
          <Box className={styles.addressesList}>
            {deliveryAdress?.data?.length > 0 ? (
              deliveryAdress.data.map((item: any, index: number) => (
                <Box
                  key={index}
                  className={`${styles.addressItem} ${
                    selectedAddress?.uuid === item.uuid ? styles.selected : ''
                  }`}
                  onClick={() => handleAddressSelect(item)}
                >
                  <Box className={styles.addressIcon}>
                    <LocationOnIcon fontSize="small" />
                  </Box>
                  <Box className={styles.addressContent}>
                    <Typography className={styles.addressName}>
                      {item.address}
                    </Typography>
                    {item.isDefault && (
                      <Typography className={styles.defaultBadge}>
                        По умолчанию
                      </Typography>
                    )}
                  </Box>
                  {selectedAddress?.uuid === item.uuid && (
                    <Box className={styles.checkIcon}>
                      <CheckIcon fontSize="small" />
                    </Box>
                  )}
                </Box>
              ))
            ) : (
              <Typography className={styles.emptyText}>
                Нет сохраненных адресов
              </Typography>
            )}
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Button
            variant="outlined"
            fullWidth
            className={styles.addButton}
            onClick={() => {
              handlePopoverClose();
              setOpenModal(true);
            }}
          >
            Добавить новый адрес
          </Button>
        </Box>
      </Popover>

      <CustomModal
        width={'50%'}
        open={openModal}
        title={'Способ доставки'}
        handleClose={handleClose}
      >
        <Box className={styles.content}>
          {deliveryAdress?.data?.map((item: any, index: number) => (
            <DeliveryAddressItemForModal key={index} {...item} />
          ))}
        </Box>
        <Box className={styles.btnGroup}>
          <Button variant='contained' className={styles.btnGroupContained}>
            Выбрать
          </Button>
          <Button variant='outlined' className={styles.btnGroupOutlined}>
            Добавить новый адрес
          </Button>
        </Box>
      </CustomModal>
    </Box>
  );
};

export default CreateAddress;
