import * as React from 'react'

interface IProps {
  children: React.ReactNode
  disabled?: boolean
  onClick?: (e: React.SyntheticEvent<HTMLButtonElement>) => any
}

const Button: React.ComponentType<IProps> = ({
  children,
  onClick,
  disabled,
}) => (
  <button disabled={disabled} onClick={onClick}>
    {children}
  </button>
)

Button.defaultProps = {
  disabled: false,
  onClick: () => {},
}

export default Button
