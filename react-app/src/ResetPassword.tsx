import React, { FC, useState } from 'react';
import { Button, Paper, TextField, makeStyles, Theme } from '@material-ui/core';
import { useMutation } from '@apollo/react-hooks';

import { RESET_PASSWORD_MUTATION } from './ResetPassword.mutation';

import { SetAlert } from './interfaces/Alert';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    maxWidth: '450px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(8),
    padding: theme.spacing(3)
  },
  marginBottom2: {
    marginBottom: theme.spacing(2)
  }
}));

interface ResetPasswordResponse {
  resetPassword: {
    success: boolean;
    errors: Array<{ path: string; message: string }>;
  };
}

const ResetPassword: FC<{ setAlert: SetAlert }> = ({ setAlert }) => {
  const [email, setEmail] = useState('');
  const classes = useStyles();
  const [passwordReset] = useMutation<ResetPasswordResponse>(RESET_PASSWORD_MUTATION);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const response = await passwordReset({
      variables: { email }
    });
    if (!response.data) {
      return;
    }
    const errorMessages = response.data.resetPassword.errors.map(error => error.message);
    setAlert({
      variant: 'success',
      messages: errorMessages,
      show: true
    });
  };

  return (
    <Paper className={classes.paper}>
      <form onSubmit={handleSubmit}>
        <TextField
          name="email"
          className={classes.marginBottom2}
          label="Email"
          type="email"
          onChange={handleChange}
          value={email}
          variant="filled"
          fullWidth
        />
        <Button type="submit" fullWidth>
          Reset Password
        </Button>
      </form>
    </Paper>
  );
};

export default ResetPassword;
