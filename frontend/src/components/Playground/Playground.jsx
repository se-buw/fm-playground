import React, { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai";
import { FaFileCirclePlus } from "react-icons/fa6";
import { IconButton, Stack } from '@mui/material';
import { MDBBtn } from 'mdb-react-ui-kit';
import { Tooltip } from 'react-tooltip'

import Editor from './Editor.jsx'
import PlainOutput from './PlainOutput.jsx'
import Tools from './Tools.jsx'
import Options from '../../assets/config/AvailableTools.js'
import FileUploadButton from '../Utils/FileUpload.jsx'
import FileDownload from '../Utils/FileDownload.jsx'
import run_limboole from '../../assets/js/limboole'
import { executeNuxmv, executeZ3 } from '../../api/toolsApi.js'
import Guides from '../Utils/Guides.jsx';
import CopyToClipboardBtn from '../Utils/CopyToClipboardBtn.jsx';
import ConfirmModal from '../Utils/Modals/ConfirmModal.jsx';
import NuxmvCopyrightNotice from '../Utils/Modals/NuxmvCopyrightNotice.jsx';
import MessageModal from '../Utils/Modals/MessageModal.jsx';

import {
  getCodeByParmalink,
  saveCode
} from '../../api/playgroundApi.js'

const Playground = ({ editorValue, setEditorValue, language, setLanguage }) => {
  const navigate = useNavigate();
  const inputDivRef = useRef();  // contains the reference to the editor area
  const outputDivRef = useRef(); // contains the reference to the output area

  const [permalink, setPermalink] = useState('') // contains `check` and `permalink` parameters
  const [output, setOutput] = useState('') // contains the output of the tool
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme === 'vs-dark';
  }); // contains the theme of the editor.
  const [isExecuting, setIsExecuting] = useState(false); // contains the state of the execution of the tool.
  const [isFullScreen, setIsFullScreen] = useState(false); // contains the state of the full screen mode.
  const [isNewSpecModalOpen, setIsNewSpecModalOpen] = useState(false); // contains the state of the new spec modal.
  const [isNuxmvModalOpen, setIsNuxmvModalOpen] = useState(false); // contains the state of the Nuxmv copyrigth notice modal.
  const [errorMessage, setErrorMessage] = useState(null); // contains the error messages from the API.
  const [isErrorMessageModalOpen, setIsErrorMessageModalOpen] = useState(false); // contains the state of the message modal.

  /**
   * Load the code and language from the URL.
   */
  useEffect(() => {
    // Get the 'check' parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const checkParam = urlParams.get('check');
    const permalinkParam = urlParams.get('p');
    const selectedOption = Options.find(option => option.short === checkParam);

    // Load the code if 'check' parameter is present
    if (permalinkParam) {
      loadCode(checkParam, permalinkParam)
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
    navigate(permalink !== '' ? `/?check=${permalink.check}&p=${permalink.permalink}` : `/?check=${checkParam}`);
  }, [permalink, navigate]);

  /**
   * Update the theme in the local storage when the theme changes.
   */
  useEffect(() => {
    localStorage.setItem('theme', isDarkTheme ? 'vs-dark' : 'vs');
  }, [isDarkTheme]);

  /**
   * Update the URL with ``check`` type when language changes.
   * @param {*} newLanguage 
   */
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    if (newLanguage.short === "ALS") {
      window.open(`https://alloy.formal-methods.net/?check=ALS`, '_self')
    } else {
      window.history.pushState(null, null, `?check=${newLanguage.short}`)
    }
  }

  /**
   * Load the code from the api. 
   * @param {*} check 
   * @param {*} permalink 
   */
  const loadCode = async (check, permalink) => {
    await getCodeByParmalink(check, permalink)
      .then((res) => {
        setEditorValue(res.code)
      })
      .catch((err) => {
        alert("Permaling not found. Redirecting...")
        window.open(`/?check=SAT`, '_self')
      })
  }

  /**
   * Find the first non-ascii character in the string.
   * Return the character and its index (line and column)
   * If no non-ascii character is found, return -1.
   * This function is used to check if the code contains non-ascii characters.
   * @param {*} str 
   * @returns -1 if no non-ascii character is found, otherwise return the character and its index (line, column).
   */
  const findNonAscii = (str) => {
    const regex = /[^\x00-\x7F]/g;
    const match = regex.exec(str);
    if (!match) return -1;
    // find the line and column and the non-ascii character
    const line = (str.substring(0, match.index).match(/\n/g) || []).length + 1;
    const column = match.index - str.lastIndexOf('\n', match.index);
    const char = match[0];
    return { line, column, char };
  }

  /**
   * Execute the tool and save the code to the database.
   * Code will be saved in the database no matter what the result of the tool is.
   * Save code returns the permalink of the code. The permalink is then used to update the URL.
   * Then the output is updated with the result of the tool.
   * If error occurs, the error modal is opened.
   */
  const handleToolExecution = async () => {
    setOutput('')
    try {
      setIsExecuting(true);
      const response = await saveCode(editorValue, language.short, permalink.permalink ? permalink.permalink : null)
      if (response) {
        setPermalink(response.data)
      }
      else {
        showErrorModal('Something went wrong. Please try again later.')
      }
      const nonAsciiIndex = findNonAscii(editorValue)
      if (nonAsciiIndex !== -1) {
        showErrorModal(`The code contains non-ASCII characters. Please remove the character '${nonAsciiIndex.char}' at line ${nonAsciiIndex.line}, column ${nonAsciiIndex.column} and try again.`)
        return
      }

      if (language.value >= 0 && language.value < 3) {
        run_limboole(window.Wrappers[language.value], editorValue)
        setIsExecuting(false);
      } else if (language.value == 3) {
        executeZ3(editorValue)
          .then((res) => {
            setOutput(res.result)
            setIsExecuting(false);
          })
          .catch((err) => {
            if (err.response.status === 503) {
              showErrorModal(err.response.data.result)
            }
            else if (err.response.status === 429) {
              showErrorModal("Slow down! You are making too many requests. Please try again later.")
            }
            setIsExecuting(false);
          })
      } else if (language.value == 4) {
        executeNuxmv(editorValue)
          .then((res) => {
            setOutput(res.result)
            setIsExecuting(false);
          })
          .catch((err) => {
            if (err.response.status === 503) {
              showErrorModal(err.response.data.result)
            }
            else if (err.response.status === 429) {
              showErrorModal("Slow down! You are making too many requests. Please try again later.")
            }
            setIsExecuting(false);
          })
      } else if (language.value == 5) {
        console.log('Executing Alloy')
      }
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        showErrorModal('Network Error. Please check your internet connection.')
      }
      else if (err.response.status === 413) {
        showErrorModal('Code too long. Please reduce the size of the code.')
      }
      else {
        showErrorModal(`Something went wrong. Please try again later.${err.message}`)
      }
    }
  }

  /**
   * Load the code from the uploaded file into the editor.
   * @param {*} file 
   */
  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setEditorValue(content);
    };
    reader.readAsText(file);
  };

  /**
   * Download the code from the editor.
   * @todo: Add handling for file extension
   * @returns 
   */
  const handleDownload = () => {
    const content = editorValue;
    const queryParams = new URLSearchParams(useLocation().search);
    const p = queryParams.get('p');
    const fileName = p ? p : 'code';
    const fileExtension = language.short == 'SMT' ? 'smt2' : language.short == 'XMV' ? 'smv' : language.short == 'als' ? 'als' : 'txt';
    return <FileDownload content={content} fileName={fileName} fileExtension={fileExtension} />;
  };

  /**
   * Update the output area with the code passed as a prop to the PlainOutput component.
   * @param {*} newCode 
   */
  const handleOutputChange = (newCode) => {
    setOutput(newCode);
  };

  /**
   * Reset the parent.
   */
  const handleReset = () => {
    setEditorValue('')
    setOutput('')
    setPermalink('')
    closeModal()
  }

  /**
   * Toggle the theme of the editor.
   */
  const handleToggleTheme = () => {
    setIsDarkTheme((prevIsDarkTheme) => !prevIsDarkTheme);
  };

  /**
   * Toggle the full screen mode of the editor and output areas.
   * @param {*} div: 'input' or 'output'
   */
  const toggleFullScreen = (div) => {
    const element = { 'input': inputDivRef.current, 'output': outputDivRef.current }[div];

    if (!document.fullscreenElement) {
      // Enter fullscreen mode
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
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

  /**
   * Display the error modal with the error message. 
   * This function is called when an error occurs in the API.
   * @param {string} message - The error message to be displayed in the modal.
   * @returns 
   */
  const showErrorModal = (message) => {
    setErrorMessage(message);
    setIsErrorMessageModalOpen(true);
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
    <div className="container">
      <Tools
        onChange={handleLanguageChange}
        selected={language}
      />
      <Tooltip id="playground-tooltip" />
      <div className="row">
        <div className="col-md-6" ref={inputDivRef} style={{ backgroundColor: 'white' }}>
          <div className='row'>
            <div className='col-md-12 mx-auto mb-2'>
              <div className='d-flex justify-content-between'>
                <div className='col-md-4'>
                  <h2>Input</h2>
                </div>
                {/* configuration/options row for the editor */}
                <div>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      color="light"
                      onClick={openModal}
                      data-tooltip-id="playground-tooltip"
                      data-tooltip-content="New Spec"
                    >
                      <FaFileCirclePlus
                        color='black'
                        role='button'
                      />
                    </IconButton>
                    <ConfirmModal
                      isOpen={isNewSpecModalOpen}
                      onClose={closeModal}
                      title='New Spec'
                      message={`Are you sure? 
                              This will reset the editor and the output areas`}
                      onConfirm={handleReset}
                    />
                    <IconButton color="light"
                      data-tooltip-id="playground-tooltip"
                      data-tooltip-content="Upload file"
                    >
                      <FileUploadButton onFileSelect={handleFileUpload} />
                    </IconButton>
                    <>
                      {handleDownload()}
                    </>
                    {permalink &&
                      <IconButton color="light"
                        data-tooltip-id="playground-tooltip"
                        data-tooltip-content="Copy Permalink">
                        <CopyToClipboardBtn permalink={permalink} />
                      </IconButton>
                    }
                    <IconButton
                      data-tooltip-id="playground-tooltip"
                      data-tooltip-content="Change theme"
                    >
                      <DarkModeSwitch
                        checked={!isDarkTheme}
                        onChange={handleToggleTheme}
                        moonColor="#000"
                      />
                    </IconButton>
                    <IconButton color='light' onClick={() => { toggleFullScreen('input') }}>
                      {isFullScreen ?
                        <AiOutlineFullscreenExit color='black'
                          data-tooltip-id="playground-tooltip"
                          data-tooltip-content="Exit"
                        />
                        : <AiOutlineFullscreen color='black'
                          data-tooltip-id="playground-tooltip"
                          data-tooltip-content="Fullscreen"
                        />}
                    </IconButton>
                  </Stack>
                </div>

              </div>
            </div>
            <Editor
              height={isFullScreen ? '80vh' : '60vh'}
              setEditorValue={setEditorValue}
              editorValue={editorValue}
              language={language}
              setLanguage={setLanguage}
              theme={isDarkTheme ? 'vs-dark' : 'vs'}
            />
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
        <div className='col-md-6' ref={outputDivRef} style={{ backgroundColor: 'white' }}>
          <div className='row'>
            <div className='col-md-12'>
              <div className={`d-flex justify-content-between ${language.id !== 'xmv' ? 'mb-3' : ''}`}>
                <h2>Output</h2>
                <IconButton color='light' onClick={() => { toggleFullScreen('output') }}>
                  {isFullScreen ?
                    <AiOutlineFullscreenExit color='black'
                      data-tooltip-id="playground-tooltip"
                      data-tooltip-content="Exit"
                    />
                    : <AiOutlineFullscreen color='black'
                      data-tooltip-id="playground-tooltip"
                      data-tooltip-content="Fullscreen"
                    />}
                </IconButton>
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
              <PlainOutput
                code={output}
                height={isFullScreen ? '80vh' : '60vh'}
                onChange={handleOutputChange} />
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
    </div>
  )
}

export default Playground