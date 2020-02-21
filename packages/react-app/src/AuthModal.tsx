import React, { FC, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tab,
  Tabs,
  makeStyles,
  Theme
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import LogIn from './LogIn';
import SignUp from './SignUp';
import Alert from './Alert';

import { AlertState } from './interfaces/Alert';

const useStyles = makeStyles((theme: Theme) => ({
  marginTop2: {
    marginTop: theme.spacing(2)
  },
  closeButton: {
    position: 'absolute',
    top: '1px',
    right: '1px'
  }
}));

interface Props {
  open: boolean;
  handleClose: ((event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void) | undefined;
  selectedTab: number;
}

const AuthModal: FC<Props> = ({ open, handleClose, selectedTab }) => {
  const [tab, setTab] = useState(selectedTab);
  const [alert, setAlert] = useState<AlertState>({ variant: 'info', messages: [], show: false });
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => setTab(newValue);
  const handleCloseAlert = () => setAlert(prevState => ({ ...prevState, show: false }));

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Tabs value={tab} onChange={handleChange}>
          <Tab label="Log In" />
          <Tab label="Sign Up" />
        </Tabs>
      </DialogTitle>
      {alert.show && (
        <Alert
          className={classes.marginTop2}
          variant={alert.variant}
          messages={alert.messages}
          onClose={handleCloseAlert}
        />
      )}
      <DialogContent>
        {tab === 0 && <LogIn setAlert={setAlert} handleClose={handleClose} />}
        {tab === 1 && <SignUp setAlert={setAlert} />}
      </DialogContent>
      <IconButton
        className={classes.closeButton}
        onClick={() => handleClose && handleClose({}, 'backdropClick')}
      >
        <Close />
      </IconButton>
    </Dialog>
  );
};

export default AuthModal;
