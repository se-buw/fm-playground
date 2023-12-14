import React from 'react'
import { FaDownload } from 'react-icons/fa';
import IconButton from '@mui/material/IconButton';
/**
 * Download a file.
 * @param {*} content - The content of the file
 * @param {*} fileName - The name of the file
 * @param {*} fileExtension - The extension of the file
 * @returns 
 */
const FileDownload = ({ content, fileName, fileExtension }) => {
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');

    link.href = window.URL.createObjectURL(blob);
    link.download = `${fileName}.${fileExtension}`;
    link.click();

    // Cleanup
    window.URL.revokeObjectURL(link.href);
  };

  return (

    <IconButton color="light" onClick={handleDownload}>
      <FaDownload
        color='black'
        role='button'
        data-tooltip-id="playground-tooltip"
        data-tooltip-content="Download file" />
    </IconButton>

  );
}

export default FileDownload