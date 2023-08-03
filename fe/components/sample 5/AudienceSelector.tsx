import React from 'react';
import { find as _find } from 'lodash';

import { Fab, List, ListItem, ListItemAvatar, ListItemText, DialogTitle, Dialog, Divider } from '@mui/material';

import PortraitIcon from '@mui/icons-material/Portrait';
import BusinessIcon from '@mui/icons-material/Business';

const AudienceSelector = (props) => {
  const { translationHelper, selectedValue, open, onClick, onClose } = props;

  const items = [
    {
      value: 'patient',
      label: translationHelper.get('common.audienceSelector.patientLabel', ''),
      icon: PortraitIcon
    },
    {
      value: 'clinician',
      label: translationHelper.get('common.audienceSelector.clinicianLabel', ''),
      icon: BusinessIcon
    }
  ];

  const selectedItem =
    _find(items, (item) => {
      return item.value === selectedValue;
    }) || items[0];

  const SelectedItemIcon = selectedItem.icon;

  const handleClose = () => {
    onClose(selectedItem);
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };

  return (
    <>
      <Fab
        size="small"
        variant="extended"
        disableRipple
        onClick={onClick}
        sx={{ textTransform: 'none', background: '#FFFFFF', borderRadius: '0', boxShadow: '0' }}
      >
        <SelectedItemIcon fontSize="large" sx={{ paddingRight: 1 }} />
        {selectedItem.label}
      </Fab>
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle sx={{ py: '10px' }}>{translationHelper.get('common.audienceSelector.title', '')}</DialogTitle>
        <Divider />
        <List sx={{ pt: 0, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <ListItem key={item.label} button onClick={() => handleListItemClick(item)}>
                <ListItemAvatar>
                  <Icon fontSize="large" />
                </ListItemAvatar>
                <ListItemText primary={item.label} />
              </ListItem>
            );
          })}
        </List>
      </Dialog>
    </>
  );
};

export default AudienceSelector;
