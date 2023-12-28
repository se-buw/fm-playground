import React, { useState } from "react";
import {
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
} from "mdb-react-ui-kit";

/**
 * Display a modal with a message.
 * @todo: Currently not used in the app.  Fix it so that it can be used in other components.
 * @param {*} title - The title of the modal.
 * @param {*} message - The message to display in the modal.
 * @returns
 */
const MessageModal = ({
  isErrorMessageModalOpen,
  setIsErrorMessageModalOpen,
  toggleErrorMessageModal,
  title,
  errorMessage,
}) => {
  const toggle = () => setIsErrorMessageModalOpen(!isErrorMessageModalOpen);
  return (
    <>
      <MDBModal
        open={isErrorMessageModalOpen}
        toggle={toggle}
        tabIndex="-1"
      >
        <MDBModalDialog>
          <MDBModalContent className="message-modal-content">
            <MDBModalHeader className="bg-danger text-white">
              <MDBModalTitle>{title}</MDBModalTitle>
              <MDBBtn
                className="btn-close text-white"
                color="none"
                onClick={toggleErrorMessageModal}
              ></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <p>{errorMessage}</p>
            </MDBModalBody>

            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={toggleErrorMessageModal}>
                Close
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  );
};

export default MessageModal;
