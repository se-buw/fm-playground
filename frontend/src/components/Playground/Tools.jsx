import React, { useState } from 'react';
import Options from '../../assets/config/AvailableTools'

import Select from 'react-select';

/**
 * Load the tools from the config file and display them in a dropdown menu.
 * @param {*} props 
 * @returns 
 */
const Tools = (props) => {
  const [options, setOptions] = useState(Options);

  return (
      <div style={{  marginTop: '100px', marginBottom: '20px' }}>     {/* TODO: fix this  */}
        <Select
          className="basic-single"
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