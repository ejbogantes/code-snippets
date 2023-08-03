import React from 'react';
import Link from 'next/link';

import {
  Fab,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  DialogTitle,
  Dialog,
  Divider,
  Box
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';

const maxNumListColumns = 4;
const minNumItemsByColumns = 6;

const LangSelector = (props) => {
  const { title, redirect, items, selectedValue, open, onClick, onSelect, onClose } = props;

  const handleClose = () => {
    onClose();
  };

  const handleListItemClick = (value) => {
    onSelect(value);
  };

  const totalItems = items.length;
  let chunkSize = Math.ceil(totalItems / maxNumListColumns);
  if (chunkSize < minNumItemsByColumns) {
    const numColumns = Math.ceil(totalItems / minNumItemsByColumns);
    chunkSize = Math.ceil(totalItems / numColumns);
  }

  const newItems = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    newItems.push(chunk);
  }

  return (
    <>
      <Fab
        size="small"
        variant="extended"
        disableRipple
        onClick={onClick}
        sx={{ textTransform: 'none', background: '#FFFFFF', borderRadius: '0', boxShadow: '0' }}
      >
        <TranslateIcon sx={{ mr: 1 }} />
        {selectedValue.label}
      </Fab>
      <Dialog onClose={handleClose} open={open} maxWidth="lg">
        <DialogTitle sx={{ py: '10px' }}>{title}</DialogTitle>
        <Divider />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            pt: 0,
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto'
          }}
        >
          {newItems.map((list, listIndex) => {
            return (
              <List key={`langList-${listIndex}`}>
                {list.map((item) => (
                  <Link key={`lang-${item.value}`} legacyBehavior href={redirect} locale={item.value}>
                    <ListItem onClick={() => handleListItemClick(item)} sx={{ cursor: 'pointer' }}>
                      <ListItemAvatar>
                        <Avatar>{item.value.toUpperCase()}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={item.label} />
                    </ListItem>
                  </Link>
                ))}
              </List>
            );
          })}
        </Box>
      </Dialog>
    </>
  );
};

export default LangSelector;
