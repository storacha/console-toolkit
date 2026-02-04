import type { As, Props, Options } from 'ariakit-react-utils'
import React from 'react'
import { createElement } from 'ariakit-react-utils'
import { useSettingsContext } from './Settings.js'

export type AccountManagementOptions<T extends As = 'div'> = Options<T>

export type AccountManagementProps<T extends As = 'div'> = Props<
  AccountManagementOptions<T>
>

/**
 * AccountManagement component - displays account management options
 */
export const AccountManagement = React.forwardRef<
  HTMLDivElement,
  AccountManagementProps<'div'>
>(function AccountManagement(props, ref) {
  return createElement('div', { ref, ...props })
})

export type AccountManagementDeleteButtonOptions<T extends As = 'button'> = Options<T>

export type AccountManagementDeleteButtonProps<T extends As = 'button'> = Props<
  AccountManagementDeleteButtonOptions<T>
>

/**
 * AccountManagement.DeleteButton - button to request account deletion
 */
export const AccountManagementDeleteButton = React.forwardRef<
  HTMLButtonElement,
  AccountManagementDeleteButtonProps<'button'>
>(function AccountManagementDeleteButton(props, ref) {
  const [, { requestAccountDeletion }] = useSettingsContext()
  return createElement('button', {
    ref,
    type: 'button',
    onClick: requestAccountDeletion,
    ...props,
  })
})

// Attach sub-components to main component
Object.assign(AccountManagement, {
  DeleteButton: AccountManagementDeleteButton,
})

