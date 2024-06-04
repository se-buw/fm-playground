import React, { useState, useEffect } from 'react';
import '../../assets/style/Playground.css'

const PlainOutput = ({ code, onChange, height }) => {
  const [internalCode, setInternalCode] = useState(code);

  /**
   * Sets the output area with the code passed as a prop.
   * @param {*} code
   * @param {*} event
   * @returns
   */
  useEffect(() => {
    setInternalCode(code);
  }, [code]);

  /**
   * Handles the change event. Updates the internal code and sends the updated code back to the parent component.
   * @param {*} event 
   */
  const handleChange = (event) => {
    const newCode = event.target.textContent;
    setInternalCode(newCode);
    onChange(newCode); // Send the updated code back to the parent component
  };

  return (
    <pre
      id='info'
      className='plain-output-box'
      contentEditable={false}
      style={{ 
        borderRadius: '8px', 
        height: height, 
        whiteSpace: 'pre-wrap' }}
      onInput={handleChange}
      dangerouslySetInnerHTML={{ __html: internalCode }}
    />
  );
};

export default PlainOutput;
