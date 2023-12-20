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
import ConfirmModal from '../Utils/ConfirmModal.jsx';

import {
getCodeByParmalink,
saveCode
}from '../../api/playgroundApi.js'

const Playground = ({ editorValue, setEditorValue, language, setLanguage }) => {
  const navigate = useNavigate();
  const [permalink, setPermalink] = useState('') // contains `check` and `permalink` parameters
  const [output, setOutput] = useState('') // contains the output of the tool
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const inputDivRef = useRef();
  const outputDivRef = useRef();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
   * Update the URL with ``check`` type when language changes.
   * @param {*} newLanguage 
   */
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    window.history.pushState(null, null, `?check=${newLanguage.short}`)
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
        console.log(err)
      })
  }

  /**
   * Execute the tool and save the code to the database.
   * @todo: Add handling for parent 
   * @todo: Add handling for tool execution
   */
  const handleToolExecution = async () => {
    try {
      setIsExecuting(true);
      await saveCode(editorValue, language.short, permalink.permalink ? permalink.permalink : null)
        .then((res) => {
          setPermalink(res)
        })
        .catch((err) => {
          console.log(err)
        })
      if (language.value >= 0 && language.value < 3) {
        run_limboole(window.Wrappers[language.value], editorValue)
      } else if (language.value == 3) {
        executeZ3(editorValue)
          .then((res) => {
            setOutput(res.result)
          })
          .catch((err) => {
            console.log(err)
          })
      } else if (language.value == 4) {
        executeNuxmv(editorValue)
          .then((res) => {
            setOutput(res.result)
          })
          .catch((err) => {
            console.log(err)
          })
      } else if (language.value == 5) {
        window.open(`${window.location.origin}/?check=ALS}`)
      }
    } catch (err) {
      console.log(err)
    } finally {
      setIsExecuting(false);
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
   * @todo: Fix the size, position and alignment of the editor and output areas in full screen mode.
   * @param {*} div: 1 for editor and 2 for output
   */
  const toggleFullScreen = (div) => {
    const element = { 1: inputDivRef.current, 2: outputDivRef.current }[div];

    if (isFullScreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }

    setIsFullScreen(!isFullScreen);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
                      isOpen={isModalOpen}
                      onClose={closeModal}
                      title='New Spec'
                      message={`Are you sure? 
                              This will reset the editor, output areas, and the permalink.`}
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
                    <IconButton color="light"
                      data-tooltip-id="playground-tooltip"
                      data-tooltip-content="Copy Permalink">
                      <CopyToClipboardBtn permalink={permalink} />
                    </IconButton>
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
                    <IconButton color='light' onClick={() => { toggleFullScreen(1) }}>
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
              <div className='d-flex justify-content-between mb-3'>
                <h2>Output</h2>
                <IconButton color='light' onClick={() => { toggleFullScreen(2) }}>
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
            <div className='col-md-12'>
              <PlainOutput code={output} onChange={handleOutputChange} />
            </div>
            {/* <div className='col-md-12'>
              <PermalinkVisualization permalink={permalink} />
            </div> */}
          </div>
        </div>
      </div>
      <Guides id={language.id} />
    </div>
  )
}

export default Playground