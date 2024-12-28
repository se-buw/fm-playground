import React from 'react';
import { useAtom } from 'jotai';
import { MDBIcon } from 'mdb-react-ui-kit';
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai';
import { isFullScreenAtom, languageAtom } from '@/atoms';
import { additonalOutputAreaUiMap, toolOutputMap } from '@/components/Playground/ToolMaps';

interface OutputAreaProps {
  onFullScreenButtonClick: () => void;
}

const OutputArea: React.FC<OutputAreaProps> = ({ onFullScreenButtonClick }) => {
  const [language] = useAtom(languageAtom);
  const [isFullScreen] = useAtom(isFullScreenAtom);

  const AdditionalUi = additonalOutputAreaUiMap[language.short];

  const OutputComponent = toolOutputMap[language.short];

  return (
    <div className='row'>
      <div className='col-md-12'>
        <div className={`d-flex justify-content-between align-items-center ${language.id !== 'xmv' ? 'mb-2' : ''}`}>
          <h2>Output</h2>
          <MDBIcon size='lg' className='playground-icon' onClick={() => onFullScreenButtonClick()}>
            {isFullScreen ? (
              <AiOutlineFullscreenExit
                className='playground-icon'
                data-tooltip-id='playground-tooltip'
                data-tooltip-content='Exit'
              />
            ) : (
              <AiOutlineFullscreen
                className='playground-icon'
                data-tooltip-id='playground-tooltip'
                data-tooltip-content='Fullscreen'
              />
            )}
          </MDBIcon>
        </div>
      </div>

      <div>{AdditionalUi && <AdditionalUi />}</div>
      <div className='col-md-12'>
        {OutputComponent ? <OutputComponent /> : <div>No output component available for {language.short}</div>}
      </div>
    </div>
  );
};

export default OutputArea;
