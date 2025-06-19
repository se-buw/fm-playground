import React, { useRef, useState } from 'react';
import { FaUpload } from 'react-icons/fa';
import MessageModal from '@/components/Utils/Modals/MessageModal';
import { fmpConfig } from '@/ToolMaps';
import '@/assets/style/Playground.css';
interface FileUploadButtonProps {
    onFileSelect: (file: File) => void;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onFileSelect }) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isErrorMessageModalOpen, setIsErrorMessageModalOpen] = useState<boolean>(false);

    const handleButtonClick = () => {
        if (fileInputRef.current) {
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

        if (file) {
            const allowedFileExtensionsFromConfig = Object.values(fmpConfig.tools)
                .map((tool) => (tool.extension.startsWith('.') ? tool.extension : `.${tool.extension}`))
                .join('|');
            const allowedFileExtensions = new RegExp(`(${allowedFileExtensionsFromConfig})$`, 'i');
            if (!allowedFileExtensions.exec(file.name)) {
                showErrorModal(
                    `Invalid file type! Only ${allowedFileExtensionsFromConfig.replace(/\|/g, ', ')} files are allowed.`
                );
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
            <input type='file' ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} />
            {errorMessage && (
                <MessageModal
                    isErrorMessageModalOpen={isErrorMessageModalOpen}
                    setIsErrorMessageModalOpen={hideErrorModal}
                    toggleErrorMessageModal={hideErrorModal}
                    title='Error'
                    errorMessage={errorMessage}
                />
            )}
        </div>
    );
};

export default FileUploadButton;
