import React, { useState } from 'react';
import '../../assets/style/Playground.css'
import Select from 'react-select';
import fmpConfig from '../../../fmp.config';
import Options from '../../assets/config/AvailableTools'

export type LanguageProps = {
  id: string;
  value: string;
  label: string;
  short: string;
}

interface ToolsProps {
  onChange: (selectedOption: any) => void; // TODO: Change any to LanguageProps when the fmp.config.ts file is ready
  selected: LanguageProps;
}



const Tools: React.FC<ToolsProps> = (props: ToolsProps) => {
  // FIXME: This is a temporary solution. The options should be generated from the fmp.config.ts file.
  const [options, setOptions] = useState(Options);

  return (
      <div className='tools'> 
        <Select
          className="basic-single react-select-container"
          classNamePrefix="select"
          defaultValue={options[0]}
          isDisabled={false}
          isLoading={false}
          isClearable={false}
          isRtl={false}
          isSearchable={true}
          name="color"
          options={options}
          onChange={props.onChange}
          value={props.selected}
        />
      </div>
  );
};

export default Tools;