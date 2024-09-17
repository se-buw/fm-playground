import React, { useState } from 'react'
import Select from 'react-select';
import { getToolsForDropdown } from '../../config';

const Tools = () => {
  const options = getToolsForDropdown();
  return (
    <div>
     <Select
        className="basic-single"
        classNamePrefix="select"
        defaultValue={options[0]}
        isDisabled={false}
        isLoading={false}
        isClearable={false}
        isRtl={false}
        isSearchable={false}
        name="available-tools"
        options={options}
      />
    </div>
  );
}

export default Tools