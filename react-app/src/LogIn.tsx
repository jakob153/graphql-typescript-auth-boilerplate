import React, { FC, useState, useContext } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { useHistory } from 'react-router-dom';
import { Box, Button, DialogContent, Link, TextField } from '@material-ui/core';
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
  const history = useHistory();
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
      if (response.errors) {
        const errorMessages = response.errors.map(error => error.message);
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
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  const handleResetPasswort = () => {
    handleClose && handleClose({}, 'backdropClick');
    history.push('/resetPassword');
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
          className={classes.marginBottom1}
          label="Password"
          type="password"
          name="password"
          onChange={handleChange}
          value={form.password}
          variant="filled"
          fullWidth
        />
        <Box marginBottom={4}>
          <Link onClick={handleResetPasswort} href="">
            Forgot Password?
          </Link>
        </Box>
        <Button type="submit" disabled={!(form.email && form.password)} fullWidth>
          Log In
        </Button>
      </form>
    </DialogContent>
  );
};

export default LogIn;
