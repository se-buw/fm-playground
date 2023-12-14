import React, { useRef } from 'react';
import { FaUpload } from 'react-icons/fa';


/**
 * Upload a file.
 * @param {*} onFileSelect - The file to upload
 * @returns 
 */
const FileUploadButton = ({ onFileSelect }) => {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    // Trigger click on the hidden file input
    fileInputRef.current.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    onFileSelect(file);

    // Clear the file input value to allow selecting the same file again
    fileInputRef.current.value = null;
  };

  return (
    <div>
      <div onClick={handleButtonClick}>
        <FaUpload  color='black' />
      </div>
      <input
        type='file'
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default FileUploadButton;
