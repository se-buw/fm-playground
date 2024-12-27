import React, { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip'
import Tools from './Tools';
import Options from '../../assets/config/AvailableTools'
import FileDownload from '../Utils/FileDownload';
import Guides from '../Utils/Guides';
import MessageModal from '../Utils/Modals/MessageModal';
import { getCodeByParmalink, } from '../../api/playgroundApi.js'
import '../../assets/style/Playground.css'
import type { LanguageProps } from './Tools';
import fmpConfig, { ToolDropdown } from '../../../fmp.config.js';
import UpdateSnackbar from '../Utils/Modals/UpdateSnackbar.js';
import { useAtom } from 'jotai';
import {
  editorValueAtom,
  languageAtom,
  permalinkAtom,
  isExecutingAtom,
  lineToHighlightAtom,
  outputAtom,
  isFullScreenAtom
} from '../../atoms';
import InputArea from './InputArea';
import OutputArea from './OutputArea.js';
import { toolExecutionMap } from './ToolMaps.js';

interface PlaygroundProps {
  editorTheme: string;
}

interface AlloyCmdOption {
  value: number;
  label: string;
}

const Playground: React.FC<PlaygroundProps> = ({ editorTheme }) => {
  const navigate = useNavigate();
  const inputDivRef = useRef<HTMLDivElement>(null);  // contains the reference to the editor area
  const outputDivRef = useRef<HTMLDivElement>(null); // contains the reference to the output area
  const [editorValue, setEditorValue] = useAtom(editorValueAtom);
  const [language, setLanguage] = useAtom(languageAtom);
  const [permalink, setPermalink] = useAtom(permalinkAtom);
  const [output, setOutput] = useAtom(outputAtom); // contains the output from the tool execution.
  const [isExecuting, setIsExecuting] = useAtom(isExecutingAtom); // contains the state of the tool execution.
  const [isFullScreen, setIsFullScreen] = useAtom(isFullScreenAtom); // contains the state of the full screen mode.
  const [isNewSpecModalOpen, setIsNewSpecModalOpen] = useState(false); // contains the state of the new spec modal.
  const [isNuxmvModalOpen, setIsNuxmvModalOpen] = useState(false); // contains the state of the Nuxmv copyrigth notice modal.
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // contains the error messages from the API.
  const [isErrorMessageModalOpen, setIsErrorMessageModalOpen] = useState(false); // contains the state of the message modal.
  const [, setLineToHighlight] = useAtom(lineToHighlightAtom); // contains the line number to highlight in the editor.
  const [alloyInstance, setAlloyInstance] = useState([]); // contains the elements for the Alloy graph.
  const [limbooleCheckOption, setLimbooleCheckOption] = useState<ToolDropdown>({ value: "1", label: 'satisfiability' }); // contains the selected option for the Limboole cli tool.
  const [alloyCmdOption, setAlloyCmdOption] = useState<AlloyCmdOption[]>([]); // contains the selected option for the Alloy cli tool.
  const [alloySelectedCmd, setAlloySelectedCmd] = useState(0); // contains the selected option for the Alloy cli tool.
  const [enableLsp, setEnableLsp] = useState(false); // contains the state of the LSP editor.

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
      const currentTool = toolExecutionMap[language.short];
      if (currentTool) {
        currentTool();
      }else{
        setIsExecuting(false);
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
          <InputArea 
           onClick={handleToolExecution}
          
          />
        </div>
        <div className='col-md-6 Playground' ref={outputDivRef} >
          <OutputArea />
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