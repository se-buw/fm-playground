import { MDBIcon } from 'mdb-react-ui-kit'
import React, { useState } from 'react'
import { 
  AiOutlineFullscreen, 
  AiOutlineFullscreenExit 
} from 'react-icons/ai'
import { useAtom } from 'jotai'
import { isFullScreenAtom, languageAtom, outputAtom } from '@/atoms'
import NuxmvCopyrightNotice from '../Utils/Modals/NuxmvCopyrightNotice'
import PlainOutput from './PlainOutput'

const OutputArea = () => {
  const [output, setOutput] = useAtom(outputAtom)
  const [language] = useAtom(languageAtom)
  const [isFullScreen, setIsFullScreen] = useAtom(isFullScreenAtom)
  const [isNuxmvModalOpen, setIsNuxmvModalOpen] = useState(false); 

  const handleOutputChange = (newCode: string) => {
    setOutput(newCode);
  };

  return (
    <div className='row'>
      <div className='col-md-12'>
        <div className={`d-flex justify-content-between align-items-center ${language.id !== 'xmv' ? 'mb-2' : ''}`}>
          <h2>Output</h2>
          {/* <MDBIcon size='lg' className='playground-icon'
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
          </MDBIcon> */}
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
  )
}

export default OutputArea