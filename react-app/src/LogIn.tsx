import React, { FC, useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { Button, DialogContent, TextField } from '@material-ui/core';
import { useStyles } from './Form.styles';

import { LOGIN_MUTATION } from './Login.mutation';

import { SetAlert } from './interfaces/Alert';

interface Props {
  handleClose: ((event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void) | undefined;
  setAlert: SetAlert;
}

const LogIn: FC<Props> = ({ setAlert, handleClose }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = event.target;

    setForm(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const { email, password } = form;

    try {
      const resp = await loginMutation({ variables: { input: { email, password } } });
      if (handleClose) {
        handleClose({}, 'backdropClick');
      }
    } catch (error) {
      setAlert({
        variant: 'error',
        messages: [`Something went wrong.`],
        show: true
      });
    }
  };

  return (
    <DialogContent>
      <form className={classes.marginTop2} action="POST" onSubmit={handleSubmit}>
        <TextField
          autoComplete="email"
          className={classes.marginBottom2}
          label="Email"
          type="email"
          name="email"
          onChange={handleChange}
          value={form.email}
          variant="filled"
          fullWidth
        />
        <TextField
          autoComplete="current-password"
          className={classes.marginBottom4}
          label="Password"
          type="password"
          name="password"
          onChange={handleChange}
          value={form.password}
          variant="filled"
          fullWidth
        />
        <Button type="submit" fullWidth>
          Log In
        </Button>
      </form>
    </DialogContent>
  );
};

export default LogIn;
