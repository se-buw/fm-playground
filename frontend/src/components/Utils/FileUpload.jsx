import React, { useRef, useState } from 'react';
import { FaUpload } from 'react-icons/fa';
import MessageModal from './Modals/MessageModal';
import '../../assets/style/Playground.css';

/**
 * Upload a file.
 * @param {*} onFileSelect - The file to upload
 * @returns 
 */
const FileUploadButton = ({ onFileSelect }) => {
  const fileInputRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState(null); // contains the error messages from the API.
  const [isErrorMessageModalOpen, setIsErrorMessageModalOpen] = useState(false); // contains the state of the message modal.

  const handleButtonClick = () => {
    // Trigger click on the hidden file input
    fileInputRef.current.click();
  };
  const showErrorModal = (message) => {
    setErrorMessage(message);
    setIsErrorMessageModalOpen(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];

    // check file type
    if (file) {
      const allowedFileExtensions = /(\.txt|\.smv|\.smt2|\.als)$/i;
      if (!allowedFileExtensions.exec(file.name)) {
        showErrorModal('Invalid file type! Only .txt, .smv, .smt2, .als files are allowed.');
        return false;
      }
    }

    // check file size
    const fileSize = file.size / 1024 / 1024; // in MB
    if (fileSize > 1) {
      showErrorModal('File is too large. Max file size is 1MB');
      return false;
    }

    onFileSelect(file);

    fileInputRef.current.value = null;
  };

  /**
   * Hide the error modal.
   * This function is called when the user clicks on the close button of the error modal.
   * @returns
   */
  const hideErrorModal = () => {
    setErrorMessage(null);
    setIsErrorMessageModalOpen(!isErrorMessageModalOpen);
  };

  return (
    <div>
      <div onClick={handleButtonClick}>
        <FaUpload className='playground-icon' />
      </div>
      <input
        type='file'
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      {errorMessage && (
        <MessageModal
          isErrorMessageModalOpen={isErrorMessageModalOpen}
          setIsErrorMessageModalOpen={hideErrorModal}
          toggleErrorMessageModal={hideErrorModal}
          title="Error"
          errorMessage={errorMessage}
        />
      )}
    </div>
  );
};

export default FileUploadButton;
