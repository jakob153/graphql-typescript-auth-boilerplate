import React, { FC, useContext, useState } from 'react';
import { AppBar, Box, Button, Link, Toolbar, Typography } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { useMutation } from '@apollo/react-hooks';
import { makeStyles } from '@material-ui/core/styles';

import AuthModal from './AuthModal';
import { UserContext } from './UserContext';

import { LOGOUT_MUTATION } from './LogOut.mutation';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1
  },
  title: {
    flexGrow: 1
  }
}));

interface ModalState {
  open: boolean;
  selectedTab: null | number;
}

const NavBar: FC = () => {
  const {
    user: { loggedIn },
    setUser
  } = useContext(UserContext);
  const [showModal, setShowModal] = useState<ModalState>({ open: false, selectedTab: null });
  const [logOutMutation] = useMutation(LOGOUT_MUTATION);
  const classes = useStyles();
  const handleClick = (selectedTab: number) => () => {
    setShowModal(prevState => ({ open: !prevState.open, selectedTab }));
  };
  const handleClose = () => {
    setShowModal(prevState => ({ open: !prevState.open, selectedTab: null }));
  };
  const handleLogout = () => {
    setUser({ email: '', loggedIn: false });
    logOutMutation();
  };
  const { open, selectedTab } = showModal;

  const renderAuthButtons = () => (
    <>
      <Button color="inherit" onClick={handleClick(0)}>
        Log In
      </Button>
      <Button color="inherit" onClick={handleClick(1)}>
        Sign Up
      </Button>
    </>
  );

  const renderLogoutButton = () => (
    <Button color="inherit" onClick={handleLogout}>
      Log Out
    </Button>
  );

  return (
    <>
      <Box flexGrow={1}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              <Link color="inherit" component={RouterLink} href="#" to="/" underline="none">
                MyApp
              </Link>
            </Typography>
            {!loggedIn ? renderAuthButtons() : renderLogoutButton()}
          </Toolbar>
        </AppBar>
      </Box>
      {selectedTab !== null && (
        <AuthModal open={open} selectedTab={selectedTab} handleClose={handleClose} />
      )}
    </>
  );
};

export default NavBar;
