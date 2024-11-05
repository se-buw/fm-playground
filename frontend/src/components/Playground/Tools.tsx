import React, { useState } from 'react';
import '../../assets/style/Playground.css'
import Select from 'react-select';
import languageOptions from '../../assets/config/languageConfig';

export type LanguageProps = {
  id: string;
  value: string;
  label: string;
  short: string;
}
interface ToolsProps {
  onChange: (selectedOption: any) => void; 
  selected: LanguageProps;
}

const Tools: React.FC<ToolsProps> = (props: ToolsProps) => {
  const [options, setOptions] = useState(languageOptions);

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
          options={languageOptions}
          onChange={props.onChange}
          value={props.selected}
        />
      </div>
  );
};

export default Tools;