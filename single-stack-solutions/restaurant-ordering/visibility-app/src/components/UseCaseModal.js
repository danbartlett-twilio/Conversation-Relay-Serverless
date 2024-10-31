import React, { useState } from "react";

import {
  Button,
  Grid,
  Column,
  Card,
  Heading,
  Form,
  FormControl,
  Label,
  Modal,
  ModalHeader,
  ModalHeading,
  ModalFooter,
  ModalFooterActions,
  ModalBody,
  Paragraph,
  Select,
  Option,
  TextArea,
  HelpText,
} from "@twilio-paste/core";

export function UseCaseModal(props) {
  // Modal properties
  const [isOpen, setIsOpen] = React.useState(false);
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  //   const modalHeadingID = useUID();

  return (
    <div>
      <Button variant="primary" onClick={handleOpen}>
        Configure - Apartment Search
      </Button>
      <Modal isOpen={isOpen} onDismiss={handleClose} size="default">
        <ModalHeader>
          <ModalHeading as="h3">Choose an author</ModalHeading>
        </ModalHeader>
        <ModalBody>
          <Paragraph>
            “If there’s a book that you want to read, but it hasn’t been written
            yet, then you must write it.” — Toni Morrison
          </Paragraph>

          <Label htmlFor="author">Choose an author</Label>
          <Select id="author">
            <Option value="baldwin">James Baldwin</Option>
            <Option value="brown">adrienne maree brown</Option>
            <Option value="butler">Octavia Butler</Option>
            <Option value="coates">Ta-Nehisi Coates</Option>
            <Option value="lorde">Audre Lorde</Option>
            <Option value="nnedi">Nnedi Okorafor</Option>
          </Select>
        </ModalBody>
        <ModalFooter>
          <ModalFooterActions>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary">Done</Button>
          </ModalFooterActions>
        </ModalFooter>
      </Modal>
    </div>
  );
}
export default UseCaseModal;
