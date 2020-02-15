import React, { FC, useState } from 'react';
import { Button, Container, Paper, TextField, makeStyles, Theme } from '@material-ui/core';
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
  const [resetPassword] = useMutation<ResetPasswordResponse>(RESET_PASSWORD_MUTATION);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await resetPassword({
        variables: { email }
      });
      if (response.errors) {
        const errorMessages = response.errors.map(error => error.message);
        setAlert({ variant: 'error', messages: [...errorMessages], show: true });
      }
      setAlert({
        variant: 'success',
        messages: ['Mail was sent successfully'],
        show: true
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  return (
    <Container>
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
    </Container>
  );
};

export default ResetPassword;
