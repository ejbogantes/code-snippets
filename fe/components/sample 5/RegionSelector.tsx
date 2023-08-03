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

const maxNumListColumns = 4;
const minNumItemsByColumns = 6;

const RegionSelector = (props) => {
  const { title, items, selectedValue, open, onClick, onSelect, onClose } = props;

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
        <Avatar
          sx={{ width: 20, height: 20, marginRight: '6px' }}
          alt={selectedValue.label}
          src={`https://assets.soom.com/icons/country-flags/${selectedValue.value}.svg`}
        />
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
              <List key={`regionList-${listIndex}`}>
                {list.map((item) => {
                  if (item.url) {
                    return (
                      <Link key={`region-${item.value}`} legacyBehavior href={item.url}>
                        <ListItem key={`region-${item.value}`} sx={{ cursor: 'pointer' }}>
                          <ListItemAvatar>
                            <Avatar
                              alt={item.label}
                              src={`https://assets.soom.com/icons/country-flags/${item.value}.svg`}
                            />
                          </ListItemAvatar>
                          <ListItemText primary={item.label} />
                        </ListItem>
                      </Link>
                    );
                  } else {
                    return (
                      <ListItem
                        key={`region-${item.value}`}
                        onClick={() => handleListItemClick(item)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            alt={item.label}
                            src={`https://assets.soom.com/icons/country-flags/${item.value}.svg`}
                          />
                        </ListItemAvatar>
                        <ListItemText primary={item.label} />
                      </ListItem>
                    );
                  }
                })}
              </List>
            );
          })}
        </Box>
      </Dialog>
    </>
  );
};

export default RegionSelector;
