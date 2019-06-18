import { useState } from 'react';

type TogglerOption<TSubState> = {
  isOpen?: boolean;
  subState?: TSubState | null;
};

const useToggler = <TSubState>(
  togglerOptions: TogglerOption<TSubState> = {},
) => {
  const initialIsOpen = togglerOptions.isOpen || false;
  const initialSubState = togglerOptions.subState || null;

  const [{ isOpen, subState }, setToggler] = useState<{
    isOpen: boolean;
    subState: TSubState | null;
  }>({
    isOpen: initialIsOpen,
    subState: initialSubState,
  });

  return {
    isOpen,
    subState,
    open: (newSubState?: TSubState) =>
      setToggler({
        isOpen: true,
        subState:
          newSubState === null || newSubState === undefined
            ? null
            : newSubState,
      }),
    close: (newSubState?: TSubState) =>
      setToggler({
        isOpen: false,
        subState:
          newSubState === null || newSubState === undefined
            ? null
            : newSubState,
      }),
    toggle: (newSubState?: TSubState) =>
      setToggler({
        isOpen: !isOpen,
        subState:
          newSubState === null || newSubState === undefined
            ? null
            : newSubState,
      }),
    setToggler,
  };
};

export default useToggler;
