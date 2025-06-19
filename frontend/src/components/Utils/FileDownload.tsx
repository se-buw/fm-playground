import React from 'react';
import { FaDownload } from 'react-icons/fa';
import { MDBIcon } from 'mdb-react-ui-kit';
import '@/assets/style/Playground.css';

interface FileDownloadProps {
    content: string;
    fileName: string;
    fileExtension: string;
}

const FileDownload: React.FC<FileDownloadProps> = ({ content, fileName, fileExtension }) => {
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
        <MDBIcon size='lg' className='playground-icon' onClick={handleDownload}>
            <FaDownload
                className='playground-icon'
                role='button'
                data-tooltip-id='playground-tooltip'
                data-tooltip-content='Download file'
            />
        </MDBIcon>
    );
};

export default FileDownload;
