import React, { createContext, ReactNode, useContext, useState } from "react";
import { Modal } from "@common/web-components";

type ModalContext = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContext | null>(null);

export function useModalContext(): ModalContext {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModalContext must be used within a modal");
  }

  return context;
}

export default function useModal({ content, openByDefault = false }: { content: ReactNode; openByDefault?: boolean }) {
  const [isOpen, setOpen] = useState(openByDefault);

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  const modal = (
    <ModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      <Modal open={isOpen} onClose={closeModal}>
        {content}
      </Modal>
    </ModalContext.Provider>
  );

  return { isOpen, openModal, closeModal, modal };
}
