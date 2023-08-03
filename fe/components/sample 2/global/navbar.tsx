import * as React from 'react';

import {
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Link,
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button
} from '@mui/material';

import { Menu as MenuIcon } from '@mui/icons-material';

import content from '../../content/menu.json';

const drawerWidth = 240;

export default function Navbar() {
  const navItems = content.navbar;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ flexWrap: 'wrap', flexDirection: 'row', p: 2 }}>
      <Box
        component="img"
        sx={{
          height: '2.3vh',
          marginLeft: 5
        }}
        alt="Soom Inc Logo"
        src="https://assets.soom.com/ws/global/Soom_Logo.png"
      />
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.title} disablePadding component="a" href={item.link} color="primary">
            <ListItemButton sx={{ color: '#000000' }}>
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box>
      <AppBar
        component="nav"
        color="primary"
        elevation={1}
        sx={{
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`
        }}>
        <Toolbar
          sx={{
            display: { xs: 'flex' },
            flexWrap: 'wrap',
            justifyContent: 'space-between'
          }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Link href="/">
            <Box
              component="img"
              sx={{
                display: { xs: 'block', sm: 'block' },
                flexGrow: 'initial',
                height: '2.3vh',
                marginLeft: 5
              }}
              alt="Soom logo"
              src="https://assets.soom.com/ws/global/Soom_Logo.png"
            />
          </Link>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            {navItems.map((item) => (
              <Button key={item.title} variant="text" color="inherit" href={item.link}>
                {item.title}
              </Button>
            ))}
          </Box>
          <Box>
            <Button variant="contained" color="secondary" href="/book-a-demo" sx={{ my: 1, mx: 1.5 }}>
              Book a Demo
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth
            }
          }}>
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
}
