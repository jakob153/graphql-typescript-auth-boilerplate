import React, { FC, useState, useContext } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { Link as RouterLink } from 'react-router-dom';
import { Button, DialogContent, Link, TextField } from '@material-ui/core';
import { useStyles } from './Form.styles';

import { UserContext } from './UserContext';

import { LOGIN_MUTATION } from './Login.mutation';

import { SetAlert } from './interfaces/Alert';

interface Props {
  handleClose: ((event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void) | undefined;
  setAlert: SetAlert;
}

interface LoginResponse {
  login: {
    user: {
      email: string;
    };
    errors: Array<{ path: string; message: string }>;
  };
}

const LogIn: FC<Props> = ({ setAlert, handleClose }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loginMutation] = useMutation<LoginResponse>(LOGIN_MUTATION);
  const { setUser } = useContext(UserContext);
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const { email, password } = form;

    try {
      const response = await loginMutation({ variables: { input: { email, password } } });
      console.log(response);
      if (response.data?.login.errors) {
        const errorMessages = response.data.login.errors.map(error => error.message);
        setAlert({
          variant: 'error',
          messages: [...errorMessages],
          show: true
        });
        return;
      }
      if (handleClose && response.data) {
        handleClose({}, 'backdropClick');
        setUser({ email: response.data.login.user.email, loggedIn: true });
      }
    } catch (error) {
      setAlert({
        variant: 'error',
        messages: [error.message],
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
      <Link component={RouterLink} to="passwordForget">
        Forgot Password?
      </Link>
    </DialogContent>
  );
};

export default LogIn;
