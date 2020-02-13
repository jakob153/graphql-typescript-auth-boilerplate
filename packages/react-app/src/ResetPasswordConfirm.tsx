import React, { FC, useState } from 'react';
import { Button, Paper, TextField, makeStyles, Theme } from '@material-ui/core';
import { useMutation } from '@apollo/react-hooks';
import { RouteChildrenProps } from 'react-router-dom';
import qs from 'qs';

import { RESET_PASSWORD_CONFIRM_MUTATION } from './ResetPasswordConfirm.mutation';

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

const ResetPasswordConfirm: FC<RouteChildrenProps> = ({ location }) => {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', newPassword2: '' });
  const classes = useStyles();
  const [resetPasswordConfirm] = useMutation(RESET_PASSWORD_CONFIRM_MUTATION);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { oldPassword, newPassword } = form;
    const { emailToken } = qs.parse(location.search, { ignoreQueryPrefix: true });

    try {
      resetPasswordConfirm({ variables: { oldPassword, newPassword, emailToken } });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };
  return (
    <Paper className={classes.paper}>
      <form onSubmit={handleSubmit}>
        <TextField
          name="oldPassword"
          className={classes.marginBottom2}
          label="Old Password"
          type="password"
          onChange={handleChange}
          value={form.oldPassword}
          variant="filled"
          fullWidth
        />
        <TextField
          name="newPassword"
          className={classes.marginBottom2}
          label="New Password"
          type="password"
          onChange={handleChange}
          value={form.newPassword}
          variant="filled"
          fullWidth
        />
        <TextField
          name="newPassword2"
          className={classes.marginBottom2}
          label="Reenter Password"
          type="password"
          onChange={handleChange}
          value={form.newPassword2}
          variant="filled"
          fullWidth
        />
        <Button
          type="submit"
          disabled={!(form.oldPassword && form.newPassword && form.newPassword2)}
          fullWidth
        >
          Reset Password
        </Button>
      </form>
    </Paper>
  );
};

export default ResetPasswordConfirm;
