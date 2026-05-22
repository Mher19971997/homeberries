import { Menu, MenuItem, Typography } from '@mui/material';

interface Props {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export const OrderMenu = ({ anchorEl, onClose }: Props) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={onClose}
  >
    <MenuItem onClick={onClose}>
      <Typography>Подробнее</Typography>
    </MenuItem>
    <MenuItem onClick={onClose}>
      <Typography color="error">Отменить</Typography>
    </MenuItem>
  </Menu>
);
