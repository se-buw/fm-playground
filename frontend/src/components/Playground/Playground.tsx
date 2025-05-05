import React, { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai";
import { FaFileCirclePlus } from "react-icons/fa6";
import { Stack } from '@mui/material';
import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import { Tooltip } from 'react-tooltip'
import Toggle from 'react-toggle';
import Editor from './Editor';
import LspEditor from './LspEditor.js';
import PlainOutput from './PlainOutput';
import Tools from './Tools';
import Options from '../../assets/config/AvailableTools'
import FileUploadButton from '../Utils/FileUpload';
import FileDownload from '../Utils/FileDownload';
import Guides from '../Utils/Guides';
import CopyToClipboardBtn from '../Utils/CopyToClipboardBtn';
import ConfirmModal from '../Utils/Modals/ConfirmModal';
import NuxmvCopyrightNotice from '../Utils/Modals/NuxmvCopyrightNotice';
import MessageModal from '../Utils/Modals/MessageModal';
import SpectraCliOptions from './SpectraCliOptions';
import LimbooleCheckOptions from './limbooleCheckOptions.js';
import { getCodeByParmalink, } from '../../api/playgroundApi.js'
import '../../assets/style/Playground.css'
import AlloyOutput from './alloy/AlloyOutput';
import AlloyCmdOptions from './alloy/AlloyCmdOptions';
import type { LanguageProps } from './Tools';
import { executeLimboole } from '../../assets/ts/toolExecutor/limbooleExecutor.js';
import { executeZ3Wasm } from '../../assets/ts/toolExecutor/z3Executor.js';
import { executeNuxmvTool } from '../../assets/ts/toolExecutor/nuxmvExecutor.js';
import { executeSpectraTool } from '../../assets/ts/toolExecutor/spectraExecutor.js';
import { executeAlloyTool } from '../../assets/ts/toolExecutor/alloyExecutor.js';
import fmpConfig, { ToolDropdown } from '../../../fmp.config.js';
import UpdateSnackbar from '../Utils/Modals/UpdateSnackbar.js';

interface PlaygroundProps {
  editorValue: string;
  setEditorValue: (value: string) => void;
  language: LanguageProps;
  setLanguage: (language: LanguageProps) => void;
  editorTheme: string;
}

interface AlloyCmdOption {
  value: number;
  label: string;
}

const Playground: React.FC<PlaygroundProps> = ({ editorValue, setEditorValue, language, setLanguage, editorTheme }) => {
  const navigate = useNavigate();
  const inputDivRef = useRef<HTMLDivElement>(null);  // contains the reference to the editor area
  const outputDivRef = useRef<HTMLDivElement>(null); // contains the reference to the output area

  const [permalink, setPermalink] = useState<{ check: string | null, permalink: string | null }>({ check: null, permalink: null }); // contains `check` and `permalink` parameters
  const [output, setOutput] = useState('') // contains the output of the tool
  const [isExecuting, setIsExecuting] = useState(false); // contains the state of the execution of the tool.
  const [isFullScreen, setIsFullScreen] = useState(false); // contains the state of the full screen mode.
  const [isNewSpecModalOpen, setIsNewSpecModalOpen] = useState(false); // contains the state of the new spec modal.
  const [isNuxmvModalOpen, setIsNuxmvModalOpen] = useState(false); // contains the state of the Nuxmv copyrigth notice modal.
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // contains the error messages from the API.
  const [isErrorMessageModalOpen, setIsErrorMessageModalOpen] = useState(false); // contains the state of the message modal.
  const [lineToHighlight, setLineToHighlight] = useState<number[]>([])
  const [spectraCliOption, setSpectraCliOption] = useState('check-realizability'); // contains the selected option for the Spectra cli tool.
  const [alloyInstance, setAlloyInstance] = useState([]); // contains the elements for the Alloy graph.
  const [limbooleCheckOption, setLimbooleCheckOption] = useState<ToolDropdown>({ value: "1", label: 'satisfiability' }); // contains the selected option for the Limboole cli tool.
  const [alloyCmdOption, setAlloyCmdOption] = useState<AlloyCmdOption[]>([]); // contains the selected option for the Alloy cli tool.
  const [alloySelectedCmd, setAlloySelectedCmd] = useState(0); // contains the selected option for the Alloy cli tool.
  const [enableLsp, setEnableLsp] = useState(true); // contains the state of the LSP editor.

  /**
   * Load the code and language from the URL.
   */
  useEffect(() => {
    // Get the 'check' parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    let checkParam = urlParams.get('check');
    if (checkParam === "VAL" || checkParam === "QBF") { checkParam = "SAT" } // v2.0.0: VAL and QBF are merged into SAT

    const permalinkParam = urlParams.get('p');
    const selectedOption = Options.find(option => option.short === checkParam);

    // Load the code if 'check' parameter is present
    if (permalinkParam) {
      if (checkParam && permalinkParam) {
        loadCode(checkParam, permalinkParam);
      }
      setPermalink({ check: checkParam, permalink: permalinkParam })
    }

    // Update the selected language if 'check' parameter is present
    if (selectedOption) {
      setLanguage(selectedOption);
    }

  }, [])

  /**
   * Update the URL when permalink changes.
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const checkParam = urlParams.get('check') ? urlParams.get('check') : language.short;
    // Update the URL when permalink changes
    navigate(permalink.permalink ? `/?check=${permalink.check}&p=${permalink.permalink}` : `/?check=${checkParam}`);
  }, [permalink, navigate]);

  /**
   * Update the URL with ``check`` type when language changes.
   * @param {*} newLanguage 
   */
  const handleLanguageChange = (newLanguage: LanguageProps) => {
    setLanguage(newLanguage)
    window.history.pushState(null, '', `?check=${newLanguage.short}`)
  }
  /**
   * Load the code from the api. 
   */
  const loadCode = async (check: string, permalink: string) => {
    await getCodeByParmalink(check, permalink)
      .then((res) => {
        setEditorValue(res.code)
      })
      .catch((err) => {
        alert("Permaling not found. Redirecting...")
        window.open(`/?check=SAT`, '_self')
      })
  }

  const handleToolExecution = async () => {
    setOutput('')
    try {
      setIsExecuting(true);

      switch (Number(language.value)) {
        case 0:
        case 1:
        case 2:
          executeLimboole({ editorValue, language, limbooleCheckOption, setLineToHighlight, setIsExecuting, showErrorModal, permalink, setPermalink, enableLsp })
          break;
        case 3:
          executeZ3Wasm({ editorValue, language, setLineToHighlight, setIsExecuting, setOutput, showErrorModal, permalink, setPermalink, enableLsp })
          break;
        case 4:
          executeNuxmvTool({ editorValue, language, setLineToHighlight, setIsExecuting, setOutput, showErrorModal, permalink, setPermalink })
          break;
        case 5:
          executeAlloyTool({ editorValue, language, setIsExecuting, setAlloyInstance, showErrorModal, alloySelectedCmd, permalink, setPermalink })
          break;
        case 6:
          executeSpectraTool({ editorValue, language, setLineToHighlight, setIsExecuting, setOutput, showErrorModal, spectraCliOption, permalink, setPermalink })
          break;
        default:
          setIsExecuting(false);
          break;
      }

    } catch (err: any) {
      if (err.code === "ERR_NETWORK") {
        showErrorModal('Network Error. Please check your internet connection.')
      }
      else if (err.response.status === 413) {
        showErrorModal('Code too long. Please reduce the size of the code.')
      }
      else {
        showErrorModal(`Something went wrong. If the problem persists, open an <a href="${fmpConfig.issues}" target="_blank">issue</a>`);
      }
    }
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

  const handleOutputChange = (newCode: string) => {
    setOutput(newCode);
  };

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

  const toggleFullScreen = (div: 'input' | 'output') => {
    const element = { 'input': inputDivRef.current, 'output': outputDivRef.current }[div as 'input' | 'output'];
    const theme = localStorage.getItem('isDarkTheme') === 'true' ? 'dark' : 'light';
    if (!document.fullscreenElement) {
      // Enter fullscreen mode
      if (element?.requestFullscreen) {
        element.requestFullscreen();
      }
      document.documentElement.setAttribute('data-theme', theme);
      setIsFullScreen(true);
    } else {
      // Exit fullscreen mode
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      document.documentElement.setAttribute('data-theme', theme);
      setIsFullScreen(false);
    }
  };

  /**
   * Add event listeners for full screen mode.
   * This is useful if the user presses the escape key to exit the full screen mode instead of clicking on the exit button.
   */
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('msfullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('msfullscreenchange', handleFullScreenChange);
    };
  }, []);

  const openModal = () => setIsNewSpecModalOpen(true); // open the new spec modal
  const closeModal = () => setIsNewSpecModalOpen(false); // close the new spec modal

  const showErrorModal = (message: string) => {
    setErrorMessage(message);
    setIsErrorMessageModalOpen(true);
  };

  const hideErrorModal = () => {
    setErrorMessage(null);
    setIsErrorMessageModalOpen(!isErrorMessageModalOpen);
  };

  const handleLineHighlight = (line: number[]) => {
    setLineToHighlight(line);
  };

  return (
    <div className="container Playground">
      <Tools
        onChange={handleLanguageChange}
        selected={language}
      />
      <Tooltip id="playground-tooltip" />
      <div className="row Playground">
        <div className="col-md-6 Playground" ref={inputDivRef}>
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
                        // FIXME: Enable for all languages once the LSP is implemented
                        disabled={language.id !== 'limboole' && language.id !== 'smt2' && language.id !== 'spectra'} 
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
                        <CopyToClipboardBtn permalink={{ check: permalink.check, permalink: permalink.permalink }} />
                      </MDBIcon>
                    }
                    <MDBIcon size='lg' className='playground-icon' onClick={() => { toggleFullScreen('input') }}>
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
                    </MDBIcon>
                  </Stack>
                </div>
              </div>
            </div>
            {enableLsp && (language.id === 'limboole' || language.id === 'smt2' || language.id === 'spectra') ?
              <LspEditor
                height={isFullScreen ? '80vh' : '60vh'}
                setEditorValue={setEditorValue}
                language={language}
                editorValue={editorValue}
                editorTheme={editorTheme}
              />
              :
              <Editor
                height={isFullScreen ? '80vh' : '60vh'}
                setEditorValue={setEditorValue}
                editorValue={editorValue}
                language={language}
                setLanguage={setLanguage}
                lineToHighlight={lineToHighlight}
                setLineToHighlight={handleLineHighlight}
                editorTheme={editorTheme}
              />
            }
            {language.id === 'limboole' &&
              <LimbooleCheckOptions
                setLimbooleCheckOption={setLimbooleCheckOption}
              />
            }
            {language.id === 'spectra' &&
              <SpectraCliOptions
                setSpectraCliOption={setSpectraCliOption}
              />
            }
            {language.id === 'als' &&
              <AlloyCmdOptions
                editorValue={editorValue}
                alloyCmdOption={alloyCmdOption}
                setAlloyCmdOption={(options: { value: number; label: string }[]) => setAlloyCmdOption(options)}
                setAlloySelectedCmd={setAlloySelectedCmd}
              />
            }
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
        </div>
        <div className='col-md-6 Playground' ref={outputDivRef} >
          <div className='row'>
            <div className='col-md-12'>
              <div className={`d-flex justify-content-between align-items-center ${language.id !== 'xmv' ? 'mb-2' : ''}`}>
                <h2>Output</h2>
                <MDBIcon size='lg' className='playground-icon'
                  onClick={() => { toggleFullScreen('output') }}>
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
                </MDBIcon>
              </div>
            </div>
            {language.id === 'xmv' && (
              <div className='col-md-12'>
                <a
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  role='button'
                  onClick={() => setIsNuxmvModalOpen(true)}>
                  nuXmv Copyright Notice
                </a>
                {/* Render the modal conditionally */}
                {isNuxmvModalOpen && (
                  <NuxmvCopyrightNotice
                    isNuxmvModalOpen={isNuxmvModalOpen}
                    setIsNuxmvModalOpen={setIsNuxmvModalOpen}
                    toggleNuxmvModal={() => setIsNuxmvModalOpen(!isNuxmvModalOpen)}
                  />
                )}
              </div>
            )}
            <div className='col-md-12'>
              {language.id === 'als' ? (
                <AlloyOutput
                  alloyInstance={alloyInstance}
                  setAlloyInstance={setAlloyInstance}
                  // height={isFullScreen ? '80vh' : '60vh'}
                  isFullScreen={isFullScreen}
                  setLineToHighlight={setLineToHighlight}
                />
              ) : (
                <PlainOutput
                  code={output}
                  height={isFullScreen ? '80vh' : '60vh'}
                  onChange={handleOutputChange} />
              )}

            </div>
          </div>
        </div>
      </div>
      <Guides id={language.id} />
      {errorMessage && (
        <MessageModal
          isErrorMessageModalOpen={isErrorMessageModalOpen}
          setIsErrorMessageModalOpen={hideErrorModal}
          toggleErrorMessageModal={hideErrorModal}
          title="Error"
          errorMessage={errorMessage}
        />
      )}
      {enableLsp && language.id === "smt2" && (
        <UpdateSnackbar
          message="This feature is experimental for the SMT language. <br/> If you encounter any misbehavior, please provide a <i>Feedback</i>." />
      )}
    </div>
  )
}

export default Playground