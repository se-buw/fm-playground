import React from 'react';
import {
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
} from 'mdb-react-ui-kit';
import '../../../assets/style/Modal.css'

const ConfirmModal = ({ isOpen, onClose, title, message, onConfirm }) => {
  const toggleOpen = () => onClose();
  const handleConfirm = () => {
    toggleOpen(); // Close the modal
    if (onConfirm && typeof onConfirm === 'function') {
      onConfirm(); // Call the onConfirm callback from the parent
    }
  };

  return (
    <>
      <MDBModal
        open={isOpen}
        onClose={toggleOpen}
        tabIndex='-1'>
        <MDBModalDialog>
          <MDBModalContent className='model-content'>
            <MDBModalHeader className='modal-header'>
              <MDBModalTitle className='modal-title'>{title}</MDBModalTitle>
              <MDBBtn className='btn-close' color='none' onClick={toggleOpen}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody className='modal-body'> <p>{message}</p></MDBModalBody>
            <MDBModalFooter className='modal-footer'>
              <MDBBtn color='secondary' onClick={toggleOpen}>
                Close
              </MDBBtn>
              <MDBBtn color='danger' onClick={handleConfirm}>Confirm</MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  )
}

export default ConfirmModal