import React, { useState, useEffect } from 'react';

const PlainOutput = ({ code, onChange }) => {
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
      contentEditable={false}
      style={{ backgroundColor: '#f4f4f4', padding: '1em', borderRadius: '8px', height: '60vh', whiteSpace: 'pre-wrap' }}
      onInput={handleChange}
      dangerouslySetInnerHTML={{ __html: internalCode }}
    />
  );
};

export default PlainOutput;
