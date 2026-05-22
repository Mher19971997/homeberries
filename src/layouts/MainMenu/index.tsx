// components/MainMenu.tsx
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';

function MainMenu() {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          {/* Add a menu icon here */}
        </IconButton>
        <Typography variant="h6">Wildberries</Typography>
        {/* Add other menu items or buttons here */}
      </Toolbar>
    </AppBar>
  );
}

export default MainMenu;
