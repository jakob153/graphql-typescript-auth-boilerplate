import React, { FC } from 'react';
import classnames from 'classnames';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  SnackbarContent,
  makeStyles,
  withStyles,
  createStyles,
  Theme
} from '@material-ui/core';
import { CheckCircle, Close, Error, Info, Warning } from '@material-ui/icons';
import { green, amber } from '@material-ui/core/colors';

const ListItemIconCustom = withStyles((theme: Theme) =>
  createStyles({
    root: {
      minWidth: '40px'
    }
  })
)(ListItemIcon);

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
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1)
  },
  color: {
    color: 'white'
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
  onClose?: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  variant: keyof typeof variantIcon;
}

const Alert: FC<Props> = ({ className, messages, onClose, variant }) => {
  const classes = useStyles();
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={classnames(classes[variant], classes.color, className)}
      message={
        <List disablePadding dense>
          {messages.map(message => (
            <ListItem key={message}>
              <ListItemIconCustom>
                <Icon className={classes.iconVariant} />
              </ListItemIconCustom>
              <ListItemText primary={message} />
            </ListItem>
          ))}
        </List>
      }
      action={
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      }
    />
  );
};

export default Alert;
