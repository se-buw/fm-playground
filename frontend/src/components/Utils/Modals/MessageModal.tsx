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

interface MessageModalProps {
    isErrorMessageModalOpen: boolean;
    setIsErrorMessageModalOpen: (value: boolean) => void;
    toggleErrorMessageModal: () => void;
    title: string;
    errorMessage: string;
}

const MessageModal: React.FC<MessageModalProps> = ({
    isErrorMessageModalOpen,
    setIsErrorMessageModalOpen,
    toggleErrorMessageModal,
    title,
    errorMessage,
}) => {
    const toggle = () => setIsErrorMessageModalOpen(!isErrorMessageModalOpen);
    return (
        <>
            <MDBModal open={isErrorMessageModalOpen} toggle={toggle} tabIndex='-1'>
                <MDBModalDialog>
                    <MDBModalContent className='message-modal-content'>
                        <MDBModalHeader className='bg-danger text-white'>
                            <MDBModalTitle>{title}</MDBModalTitle>
                            <MDBBtn
                                className='btn-close text-white'
                                color='none'
                                onClick={toggleErrorMessageModal}
                            ></MDBBtn>
                        </MDBModalHeader>
                        <MDBModalBody>
                            <div dangerouslySetInnerHTML={{ __html: errorMessage }} />
                        </MDBModalBody>
                        <MDBModalFooter>
                            <MDBBtn color='secondary' onClick={toggleErrorMessageModal}>
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
