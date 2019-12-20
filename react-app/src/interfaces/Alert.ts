import { Dispatch, SetStateAction } from 'react';
import { variantIcon } from '../Alert';

export type SetAlert = Dispatch<
  SetStateAction<{
    variant: 'success' | 'error' | 'warning' | 'info';
    messages: Array<string>;
    show: boolean;
  }>
>;

export interface AlertState {
  variant: keyof typeof variantIcon;
  messages: Array<string>;
  show: boolean;
}
