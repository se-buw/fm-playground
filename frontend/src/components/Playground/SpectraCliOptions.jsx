import React from 'react';
import Select from 'react-select';


const SpectraCliOptions = ({setSpectraCliOption }) => {
  const options = [
    { value: 'check-realizability', label: 'Check Realizability' },
    { value: 'concrete-controller', label: 'Synthesize Controller' },
    { value: 'concrete-counter-strategy', label: 'Counter-strategy' },
    { value: 'unrealizable-core', label: 'Unrealizable core' },
    { value: 'check-well-sep', label: 'Check well-separation' },
    { value: 'non-well-sep-core', label: 'Non-well-separated core' },
  ]

  const handleOptionChange = (selectedOption) => {
    setSpectraCliOption(selectedOption.value)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
      <p style={{ marginRight: '10px', marginTop: '5px' }}>Command:</p>
      <div style={{ width: '70%' }}>
        <Select
          className="basic-single"
          classNamePrefix="select"
          defaultValue={options[0]}
          isDisabled={false}
          isLoading={false}
          isClearable={false}
          isRtl={false}
          isSearchable={true}
          options={options}
          onChange={handleOptionChange}
        />
      </div>
    </div>
  );
};

export default SpectraCliOptions;