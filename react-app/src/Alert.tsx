import React, { FC, Fragment } from 'react';
import classnames from 'classnames';
import { IconButton, SnackbarContent } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { CheckCircle, Close, Error, Info, Warning } from '@material-ui/icons';
import { green, amber } from '@material-ui/core/colors';

const useStyles = makeStyles((theme: Theme) => ({
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  info: {
    backgroundColor: theme.palette.primary.main
  },
  warning: {
    backgroundColor: amber[700]
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1)
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  }
}));

export const variantIcon = {
  success: CheckCircle,
  warning: Warning,
  error: Error,
  info: Info
};

interface Props {
  className?: string;
  messages: Array<string>;
  onClose?: () => void;
  variant: keyof typeof variantIcon;
}

const Alert: FC<Props> = ({ className, messages, onClose, variant }) => {
  const classes = useStyles();
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={classnames(classes[variant], className)}
      message={
        <span className={classes.message}>
          <Icon className={classnames(classes.icon, classes.iconVariant)} />
          {messages.map(message => (
            <Fragment key={message}>{message}</Fragment>
          ))}
        </span>
      }
      action={[
        <IconButton onClick={onClose}>
          <Close className={classes.icon} />
        </IconButton>
      ]}
    />
  );
};

export default Alert;
