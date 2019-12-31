import React, { useEffect, useState } from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import Navbar from './Navbar';
import qs from 'qs';

import Alert from './Alert';

import { AlertState } from './interfaces/Alert';

const useStyles = makeStyles((theme: Theme) => ({
  marginTop4: {
    marginTop: theme.spacing(4)
  }
}));

const Main = () => {
  const [alert, setAlert] = useState<AlertState>({ variant: 'info', messages: [], show: false });
  const classes = useStyles();

  useEffect(() => {
    const params = qs.parse(window.location.search.replace('?', ''));

    if (params?.confirmAccount) {
      setAlert({
        variant: params.confirmAccount === 'true' ? 'success' : 'error',
        messages: [
          params.confirmAccount === 'true'
            ? 'Account Confirmed! You can now log in.'
            : 'Something went wrong.'
        ],
        show: true
      });
    }
  }, []);

  const handleAlertClose = () => setAlert(prevState => ({ ...prevState, show: false }));

  return (
    <>
      <Navbar />
      {alert.show && (
        <Alert
          className={classes.marginTop4}
          variant={alert.variant}
          messages={alert.messages}
          onClose={handleAlertClose}
        />
      )}
      <h5>MAIN PAGE</h5>
    </>
  );
};

export default Main;
