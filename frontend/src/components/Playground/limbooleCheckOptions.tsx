import React from "react";
import Select, { SingleValue } from "react-select";
import fmpConfig from "../../../fmp.config";
import { ToolDropdown } from "../../../fmp.config";

interface LimbooleCheckOptionsProps {
  setLimbooleCheckOption: (option: ToolDropdown) => void;
}

const LimbooleCheckOptions: React.FC<LimbooleCheckOptionsProps> = ({ setLimbooleCheckOption }) => {
  const options = fmpConfig.tools.limboole.commandDropdown?.map((option) => {
    return {
      value: option.value,
      label: option.label
    }
  }) || [];

  const handleOptionChange = (selectedOption: SingleValue<{ value: string; label: string }>) => {
    if (selectedOption) {
      setLimbooleCheckOption(selectedOption as ToolDropdown);
    }
  };


  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}>
      <p style={{ marginRight: "10px", marginTop: "5px" }}>Check:</p>
      <div style={{ width: "70%" }}>
        <Select
          className="basic-single react-select-container"
          classNamePrefix="select"
          defaultValue={options[1] || null}
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
  )
};

export default LimbooleCheckOptions;