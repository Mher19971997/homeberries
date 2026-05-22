import * as React from 'react';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import styles from '@homeberris/components/BasicPopover/index.module.css';
import { Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface BasicPopoverProps {
  title: string;
  children: React.ReactNode;
  active?: boolean;
}

const BasicPopover: React.FC<BasicPopoverProps> = ({ title, children, active = false }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <Box className={styles.btnGroup}>
        <Button
          className={`${styles.openBtn} ${active ? styles.active : ''} ${open ? styles.open : ''}`}
          aria-describedby={id}
          variant='contained'
          onClick={handleClick}
        >
          {title}
          {open ? <ExpandLessIcon className={styles.icon} /> : <ExpandMoreIcon className={styles.icon} />}
        </Button>
      </Box>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        PaperProps={{
          className: styles.popoverPaper,
          style: {
            maxWidth: 'calc(100vw - 32px)',
            overflowX: 'hidden',
          }
        }}
        disableRestoreFocus
        disableScrollLock={true}
      >
        {children}
      </Popover>
    </div>
  );
};

export default BasicPopover;
