import React, { useRef, useState } from 'react';
import { FaUpload } from 'react-icons/fa';
import MessageModal from './Modals/MessageModal';
import '../../assets/style/Playground.css';

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);  // contains the error messages from the API.
  const [isErrorMessageModalOpen, setIsErrorMessageModalOpen] = useState<boolean>(false); // contains the state of the message modal.

  const handleButtonClick = () => {
    // Trigger click on the hidden file input
    if(fileInputRef.current){
      fileInputRef.current.click();
    }
  };
  const showErrorModal = (message: string) => {
    setErrorMessage(message);
    setIsErrorMessageModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      showErrorModal('No file selected! Please select a file to upload.');
      return;
    }

    // TODO: This should be an enum later
    if (file) {
      const allowedFileExtensions = /(\.txt|\.smv|\.smt2|\.als|\.spectra)$/i;
      if (!allowedFileExtensions.exec(file.name)) {
        showErrorModal('Invalid file type! Only .txt, .smv, .smt2, .als, .spectra files are allowed.');
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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
