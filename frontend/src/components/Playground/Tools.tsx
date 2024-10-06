import React, { useState } from 'react';
import Options from '../../assets/config/AvailableTools'
import '../../assets/style/Playground.css'

import Select from 'react-select';

export type LanguageProps = {
  id: string;
  value: string;
  label: string;
  short: string;
}

interface ToolsProps {
  onChange: (selectedOption: any) => void; // TODO: maybe change this to LanguageProps
  selected: LanguageProps;
}


const Tools: React.FC<ToolsProps> = (props: ToolsProps) => {
  const [options, setOptions] = useState(Options);

  return (
      <div className='tools'>     {/* TODO: fix this  */}
        <Select
          className="basic-single react-select-container"
          classNamePrefix="select"
          defaultValue={options[1]}
          isDisabled={false}
          isLoading={false}
          isClearable={false}
          isRtl={false}
          isSearchable={true}
          name="color"
          options={Options}
          onChange={props.onChange}
          value={props.selected}
        />
      </div>
  );
};

export default Tools;