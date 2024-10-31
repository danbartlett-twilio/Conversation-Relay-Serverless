import {
  Button,
  Modal,
  ModalHeader,
  ModalHeading,
  ModalFooter,
  ModalFooterActions,
  ModalBody,
  Paragraph,
  Spinner,
} from "@twilio-paste/core";

import { SuccessIcon } from "@twilio-paste/icons/esm/SuccessIcon";

export function Loading(props) {
  return (
    <div>
      <Modal isOpen={props.isOpen} onDismiss={props.handleClose} size="default">
        <ModalHeader>
          {props.isLoading ? (
            <ModalHeading as="h3">Loading...</ModalHeading>
          ) : (
            <ModalHeading as="h3">Success</ModalHeading>
          )}
        </ModalHeader>
        <ModalBody>
          {props.isLoading ? (
            <Paragraph>
              {props.loadingMessage}
              <Spinner size="sizeIcon110" decorative={false} title="Loading" />
            </Paragraph>
          ) : (
            <Paragraph>
              {props.successMessage}
              <SuccessIcon decorative={false} title="Sucess Message" />
            </Paragraph>
          )}
        </ModalBody>
        <ModalFooter>
          <ModalFooterActions>
            <Button variant="primary" onClick={props.handleClose}>
              Done
            </Button>
          </ModalFooterActions>
        </ModalFooter>
      </Modal>
    </div>
  );
}
export default Loading;
