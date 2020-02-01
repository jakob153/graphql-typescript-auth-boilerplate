import React, { FC, useState } from 'react';
import { Button, DialogContent, TextField } from '@material-ui/core';
import { useMutation } from '@apollo/react-hooks';

import { SetAlert } from './interfaces/Alert';

import { REGISTER_MUTATION } from './Register.mutation';

import { useStyles } from './Form.styles';

interface Props {
  setAlert: SetAlert;
}

const SignUp: FC<Props> = ({ setAlert }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    password2: ''
  });
  const classes = useStyles();
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
    const { name, value } = event.target;
    setForm(prevState => ({ ...prevState, [name]: value }));
  };

  const validateForm = (password: string, password2: string) => {
    let formValid = true;
    const messages = [];

    if (password.length < 5) {
      formValid = false;
      messages.push('Password must have at least 6 characters');
    } else if (password !== password2) {
      formValid = false;
      messages.push('Passwords do not match');
    }

    return { formValid, messages };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { email, password, password2 } = form;

    const { formValid, messages } = validateForm(password, password2);

    if (!formValid) {
      setAlert({ variant: 'error', messages, show: true });
      return;
    }
    try {
      await registerMutation({ variables: { input: { email, password } } });
      setAlert({
        variant: 'success',
        messages: ['A Confirmation Link was sent to your Mail.'],
        show: true
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  return (
    <DialogContent>
      <form className={classes.marginTop2} onSubmit={handleSubmit}>
        <TextField
          name="email"
          label="Email"
          type="email"
          className={classes.marginBottom2}
          onChange={handleChange}
          value={form.email}
          variant="filled"
          fullWidth
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          className={classes.marginBottom2}
          onChange={handleChange}
          value={form.password}
          variant="filled"
          fullWidth
        />
        <TextField
          name="password2"
          label="Confirm Password"
          type="password"
          className={classes.marginBottom4}
          onChange={handleChange}
          value={form.password2}
          variant="filled"
          fullWidth
        />
        <Button type="submit" disabled={!(form.email && form.password && form.password2)} fullWidth>
          Sign Up
        </Button>
      </form>
    </DialogContent>
  );
};

export default SignUp;
