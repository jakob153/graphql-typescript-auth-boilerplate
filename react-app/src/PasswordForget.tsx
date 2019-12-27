import React, { FC, useState } from 'react';
import { Button, DialogContent, FormControl, Input, InputLabel } from '@material-ui/core';
import { useMutation } from '@apollo/react-hooks';

import { PASSWORD_RESET_MUTATION } from './PasswordReset.mutation';

import { SetAlert } from './interfaces/Alert';

const PasswordForget: FC<{ setAlert: SetAlert }> = ({ setAlert }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [passwordReset] = useMutation(PASSWORD_RESET_MUTATION);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (event: any): Promise<void> => {
    event.preventDefault();
    try {
      await passwordReset({ variables: { password: form.password } });
      setAlert({ variant: 'success', messages: ['Email Sent'], show: true });
    } catch (error) {
      setAlert({ variant: 'error', messages: [error.message], show: true });
    }
  };

  return (
    <DialogContent>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth>
          <InputLabel htmlFor="component-email">Email</InputLabel>
          <Input
            id="component-email"
            name="email"
            type="email"
            onChange={handleChange}
            value={form.email}
          />
        </FormControl>
        <FormControl fullWidth>
          <InputLabel htmlFor="component-password">Password</InputLabel>
          <Input
            id="component-password"
            name="password"
            type="password"
            onChange={handleChange}
            value={form.password}
          />
        </FormControl>
        <Button type="submit" fullWidth>
          Sign Up
        </Button>
      </form>
    </DialogContent>
  );
};

export default PasswordForget;
