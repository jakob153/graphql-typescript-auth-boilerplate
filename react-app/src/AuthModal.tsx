import React, { FC, useState } from 'react';
import { Dialog, Tab, Tabs, makeStyles, Theme } from '@material-ui/core';
import LogIn from './LogIn';
import SignUp from './SignUp';
import Alert from './Alert';

import { AlertState } from './interfaces/Alert';

const useStyles = makeStyles((theme: Theme) => ({
  marginTop2: {
    marginTop: theme.spacing(2)
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
  const [closeAlert, setCloseAlert] = useState(false);
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number): void => setTab(newValue);
  const handleCloseAlert = () => setCloseAlert(prevState => !prevState);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <Tabs value={tab} onChange={handleChange} centered>
        <Tab label="Log In" />
        <Tab label="Sign Up" />
      </Tabs>
      {alert.show && !closeAlert && (
        <Alert
          className={classes.marginTop2}
          variant={alert.variant}
          messages={alert.messages}
          onClose={handleCloseAlert}
        />
      )}
      {tab === 0 && <LogIn setAlert={setAlert} handleClose={handleClose} />}
      {tab === 1 && <SignUp setAlert={setAlert} />}
    </Dialog>
  );
};

export default AuthModal;
