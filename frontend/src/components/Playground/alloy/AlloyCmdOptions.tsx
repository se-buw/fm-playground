import React, { useState, useEffect } from 'react'
import Select, { SingleValue } from 'react-select';

interface AlloyCmdOptionsProps {
  editorValue: string;
  alloyCmdOption: { value: number, label: string }[];
  setAlloyCmdOption: (options: { value: number, label: string }[]) => void;
  setAlloySelectedCmd: (index: number) => void;
}

const AlloyCmdOptions: React.FC<AlloyCmdOptionsProps> = ({ editorValue, alloyCmdOption, setAlloyCmdOption, setAlloySelectedCmd }) => {

  const findIndexByValue = (cmdOptionValue: number) => {
    return alloyCmdOption.findIndex((option) => option.value === cmdOptionValue)
  }

  useEffect(() => {
    if (editorValue) {
      const lines = editorValue.split('\n')
      const options = []
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line.startsWith('run') || line.startsWith('check')) {
          const option = line
          options.push({ value: i, label: option })
        }
      }
      setAlloyCmdOption(options)
    }
  }, [editorValue])

  
  
  const handleOptionChange = (selectedOption: SingleValue<{ value: number, label: string }>) => {
    if (selectedOption) {
      setAlloySelectedCmd(findIndexByValue(selectedOption.value))
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
      <p style={{ marginRight: '10px', marginTop: '5px' }}>Command:</p>
      <div style={{ width: '70%' }}>
        <Select
          className="basic-single react-select-container"
          classNamePrefix="select"
          isDisabled={false}
          isLoading={false}
          isClearable={false}
          isRtl={false}
          isSearchable={true}
          options={alloyCmdOption}
          onChange={handleOptionChange}
        />
      </div>
    </div>
  )
}

export default AlloyCmdOptions