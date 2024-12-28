import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { fmpConfig } from '@/components/Playground/ToolMaps';
import '@/assets/style/Playground.css';

export type LanguageProps = {
  id: string;
  value: string;
  label: string;
  short: string;
};
interface ToolsProps {
  onChange: (selectedOption: any) => void;
  selected: LanguageProps;
}

const Tools: React.FC<ToolsProps> = (props: ToolsProps) => {
  const [options, setOptions] = useState<{ id: string; value: string; label: string; short: string }[]>([]);

  useEffect(() => {
    const generatedOptions = Object.entries(fmpConfig.tools).map(([key, tool]) => ({
      id: key,
      value: tool.extension,
      label: tool.name,
      short: tool.shortName,
    }));
    setOptions(generatedOptions);
  }, []);

  return (
    <div className='tools'>
      <Select
        className='basic-single react-select-container'
        classNamePrefix='select'
        defaultValue={options[0]}
        isDisabled={false}
        isLoading={false}
        isClearable={false}
        isRtl={false}
        isSearchable={true}
        name='color'
        options={options}
        onChange={props.onChange}
        value={props.selected}
      />
    </div>
  );
};

export default Tools;
