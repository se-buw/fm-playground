import React, { lazy, useState, Suspense } from 'react'
import { useLocation } from 'react-router-dom';
import { Stack } from '@mui/material';
import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import Toggle from 'react-toggle';
import { useAtom } from 'jotai';
import { enableLspAtom, editorValueAtom, outputAtom, permalinkAtom, languageAtom, isExecutingAtom, isFullScreenAtom } from '@/atoms';
import { FaFileCirclePlus } from 'react-icons/fa6';
import ConfirmModal from '@/components/Utils/Modals/ConfirmModal';
import FileUploadButton from '@/components/Utils/FileUpload';
import FileDownload from '@/components/Utils/FileDownload';
import CopyToClipboardBtn from '@/components/Utils/CopyToClipboardBtn';
import LspEditor from './LspEditor';
import Editor from './Editor';
import fmpConfig from '../../../fmp.config';
import { additionalInputAreaUiMap } from './ToolMaps'

const InputArea = ({ onClick: handleToolExecution }: { onClick: () => void }) => {
  const [enableLsp, setEnableLsp] = useAtom(enableLspAtom);
  const [editorValue, setEditorValue] = useAtom(editorValueAtom);
  const [, setOutput] = useAtom(outputAtom);
  const [permalink, setPermalink] = useAtom(permalinkAtom);
  const [language, setLanguage] = useAtom(languageAtom);
  const [isExecuting] = useAtom(isExecutingAtom);
  const [isFullScreen] = useAtom(isFullScreenAtom);

  const [isNewSpecModalOpen, setIsNewSpecModalOpen] = useState(false); // state to control the new spec modal

  const AdditionalUi = additionalInputAreaUiMap[language.short]

  const openModal = () => setIsNewSpecModalOpen(true); // open the new spec modal
  const closeModal = () => setIsNewSpecModalOpen(false); // close the new spec modal

  const handleReset = () => {
    setEditorValue('')
    setOutput('')
    const infoElement = document.getElementById('info');
    if (infoElement) {
      infoElement.innerHTML = '';
    }
    setPermalink({ check: null, permalink: null })
    closeModal()
  }

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target) {
        const content = e.target.result as string;
        setEditorValue(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    const content = editorValue;
    const queryParams = new URLSearchParams(useLocation().search);
    const p = queryParams.get('p');
    const fileName = p ? p : 'code';
    const fileExtension = language.short == 'SMT' ? 'smt2' : language.short == 'XMV' ? 'smv' : language.short == 'SPECTRA' ? 'spectra' : language.short == 'als' ? 'als' : 'txt';
    return <FileDownload content={content} fileName={fileName} fileExtension={fileExtension} />;
  };


  return (
    <div className='row'>
      <div className='col-md-12 mx-auto mb-2'>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='col-md-4'>
            <h2>Input</h2>
          </div>
          <div>
            <Stack direction="row" spacing={1}>
              <span className='syntax-checking-span'>Syntax Checking</span>
              <MDBIcon size='lg' className='playground-icon'
                style={{ marginTop: "5px" }}
                data-tooltip-id="playground-tooltip"
                data-tooltip-content="This allows you to check the syntax of the code, get suggestions/code completion."
              >
                <Toggle
                  id='cheese-status'
                  defaultChecked={enableLsp}
                  onChange={(e) => setEnableLsp(e.target.checked)}
                />
              </MDBIcon >
              <MDBIcon size='lg' className='playground-icon'
                onClick={openModal}
                data-tooltip-id="playground-tooltip"
                data-tooltip-content="New Spec"
              >
                <FaFileCirclePlus
                  className='playground-icon'
                  role='button'
                />
              </MDBIcon>
              <ConfirmModal
                isOpen={isNewSpecModalOpen}
                onClose={closeModal}
                title='New Spec'
                message={`Are you sure? 
                              This will reset the editor and the output areas`}
                onConfirm={handleReset}
              />
              <MDBIcon size='lg' className='playground-icon'
                data-tooltip-id="playground-tooltip"
                data-tooltip-content="Upload file"
              >
                <FileUploadButton onFileSelect={handleFileUpload} />
              </MDBIcon>
              <>
                {handleDownload()}
              </>
              {permalink.check && permalink.permalink &&
                <MDBIcon size='lg' className='playground-icon'
                  data-tooltip-id="playground-tooltip"
                  data-tooltip-content="Copy Permalink">
                  <CopyToClipboardBtn />
                </MDBIcon>
              }
              {/* <MDBIcon size='lg' className='playground-icon' onClick={() => { toggleFullScreen('input') }}>
                {isFullScreen ?
                  <AiOutlineFullscreenExit
                    className='playground-icon'
                    data-tooltip-id="playground-tooltip"
                    data-tooltip-content="Exit"
                  />
                  : <AiOutlineFullscreen
                    className='playground-icon'
                    data-tooltip-id="playground-tooltip"
                    data-tooltip-content="Fullscreen"
                  />}
              </MDBIcon> */}
            </Stack>
          </div>
        </div>
      </div>
      {enableLsp && (language.id === 'limboole' || language.id === 'smt2') ?
        <LspEditor
          height={isFullScreen ? '80vh' : '60vh'}
          editorTheme="vs"
        />
        :
        <Editor
          height={isFullScreen ? '80vh' : '60vh'}
          editorTheme="vs"
        />
      }

      <div className="w-full px-1 pt-2">
        {AdditionalUi && <AdditionalUi />}
      </div>
      <MDBBtn
        className='mx-auto my-3'
        style={{ width: '95%' }}
        color='primary'
        onClick={handleToolExecution}
        disabled={isExecuting}
      >
        {isExecuting ? 'Running...' : 'RUN'}
      </MDBBtn>
    </div>
  )
}

export default InputArea