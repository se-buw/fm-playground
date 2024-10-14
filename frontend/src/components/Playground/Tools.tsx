import React, { useState } from 'react';
import '../../assets/style/Playground.css'
import Select from 'react-select';
import fmpConfig from '../../../fmp.config';


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

const options = Object.values(fmpConfig.tools).map(tool => ({
  id: tool.name.toLowerCase(),
  value: tool.dropdown.value,
  label: tool.dropdown.label,
  short: tool.shortName
}));


const Tools: React.FC<ToolsProps> = (props: ToolsProps) => {
  const [optionsState, setOptionsState] = useState(options);

  return (
      <div className='tools'>     {/* TODO: fix this  */}
        <Select
          className="basic-single react-select-container"
          classNamePrefix="select"
          defaultValue={optionsState[0]}
          isDisabled={false}
          isLoading={false}
          isClearable={false}
          isRtl={false}
          isSearchable={true}
          name="color"
          options={optionsState}
          onChange={props.onChange}
          value={props.selected}
        />
      </div>
  );
};

export default Tools;