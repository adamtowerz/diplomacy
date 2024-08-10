import classNames from "classnames";
import React, { ReactNode, useContext, useEffect, useRef, useState } from "react";
import { Button, Icon, useClickOutside, useFocusOnHover } from "@common/web-components";
import { EntangledOptionalKeys } from "@/utils/types";
import { getChildOfType, getChildrenNotOfType } from "./Slots";

type PopoverHarness = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const PopoverContext = React.createContext<PopoverHarness | null>(null);

function usePopover(initialState = false) {
  const [isOpen, setOpen] = useState(initialState);

  function open() {
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  function toggle() {
    setOpen(!isOpen);
  }

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ToggleOverride(_: { children: (harness: PopoverHarness) => React.ReactNode }) {
  return <></>;
}

function ToggleContent({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MenuOverride(_: { children: (harness: PopoverHarness) => React.ReactNode }) {
  return <></>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MenuContent(_: { children: (harness: PopoverHarness) => React.ReactNode }) {
  return <></>;
}

export type PopoverProps = EntangledOptionalKeys<PopoverHarness> & {
  children?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
};

export default function Popover({ children, fullWidth = false, disabled = false, ...rest }: PopoverProps) {
  const uncontrolledHarness = usePopover();
  const harness = rest.open ? rest : uncontrolledHarness;

  const toggleOverride = getChildOfType(children, ToggleOverride);
  const toggleContent = getChildOfType(children, ToggleContent);
  const menuOverride = getChildOfType(children, MenuOverride);
  const menuContent = getChildOfType(children, MenuContent);

  const content = getChildrenNotOfType(children, [ToggleOverride, ToggleContent, MenuOverride, MenuContent]);

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, harness.close);

  const toggle = toggleOverride?.props.children(harness) ?? (
    <Button
      disabled={disabled}
      className={classNames("flex items-center", { "w-full justify-center": fullWidth })}
      onClick={harness.toggle}
      theme="secondary"
    >
      {toggleContent ?? "¡Toggle!"} <Icon name="expand_more" className="ml-1" />
    </Button>
  );

  const menu = menuOverride?.props.children(harness) ?? (
    <div className="bg-white rounded border border-gray-700 overflow-hidden">
      {menuContent?.props.children(harness) ?? content.length > 0 ? content : undefined ?? "¡Popover!"}
    </div>
  );

  useEffect(() => {
    if (harness.isOpen && menuRef.current) {
      menuRef.current.focus();
    }
  }, [harness.isOpen]);

  return (
    <PopoverContext.Provider value={harness}>
      <div ref={containerRef} tabIndex={-1} className={classNames("inline-block relative", { "w-full": fullWidth })}>
        {toggle}
        {harness.isOpen && (
          <div ref={menuRef} className="absolute top-[calc(100%_+_4px)] min-w-full">
            {menu}
          </div>
        )}
      </div>
    </PopoverContext.Provider>
  );
}

function MenuItem({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useFocusOnHover(ref);

  const popoverHarness = useContext(PopoverContext);

  function clickHandler() {
    onClick?.();
    popoverHarness?.close();
  }

  return (
    <Button
      ref={ref}
      onClick={clickHandler}
      theme="custom"
      className="focus:bg-green-300 focus-visible:outline-none active:bg-green-400 w-full text-left"
    >
      {children}
    </Button>
  );
}

Popover.ToggleOverride = ToggleOverride;
Popover.ToggleContent = ToggleContent;
Popover.MenuOverride = MenuOverride;
Popover.MenuContent = MenuContent;
Popover.usePopover = usePopover;
Popover.MenuItem = MenuItem;
