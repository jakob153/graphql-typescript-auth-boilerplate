import React, { FC, useState } from 'react';
import { Dialog, Tab, Tabs } from '@material-ui/core';
import LogIn from './LogIn';
import SignUp from './SignUp';
import Alert from './Alert';

import { AlertState } from './interfaces/Alert';

interface Props {
  open: boolean;
  handleClose: ((event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void) | undefined;
  selectedTab: number;
}

const AuthModal: FC<Props> = ({ open, handleClose, selectedTab }) => {
  const [tab, setTab] = useState(selectedTab);
  const [alert, setAlert] = useState<AlertState>({ variant: 'info', messages: [], show: false });

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number): void => setTab(newValue);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <Tabs value={tab} onChange={handleChange} centered>
        <Tab label="Log In" />
        <Tab label="Sign Up" />
      </Tabs>
      {alert.show && <Alert variant={alert.variant} messages={alert.messages} />}
      {tab === 0 && <LogIn setAlert={setAlert} />}
      {tab === 1 && <SignUp setAlert={setAlert} />}
    </Dialog>
  );
};

export default AuthModal;
