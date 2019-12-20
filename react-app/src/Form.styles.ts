import { Theme, makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  marginTop2: {
    marginTop: theme.spacing(2)
  },
  marginBottom2: {
    marginBottom: theme.spacing(2)
  },
  marginBottom4: {
    marginBottom: theme.spacing(4)
  }
}));
