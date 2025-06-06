import React, { useState, useEffect } from 'react';
import '../../assets/style/Playground.css'

interface PlainOutputProps {
  code: string;
  onChange: (code: string) => void;
  height: string;
}

const PlainOutput: React.FC<PlainOutputProps> = ({ code, onChange, height }) => {
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
  const handleChange = (event: React.FormEvent<HTMLPreElement>) => {
    const newCode = event.currentTarget.textContent || '';
    setInternalCode(newCode);
    onChange(newCode); // Send the updated code back to the parent component
  };

  // Check if the code contains HTML tags (for backward compatibility)
  const containsHTML = /<[^>]*>/.test(internalCode);

  return (
    <pre
      id='info'
      className='plain-output-box'
      contentEditable={false}
      style={{
        borderRadius: '8px',
        height: height,
        whiteSpace: 'pre-wrap'
      }}
      onInput={handleChange}
      {...(containsHTML 
        ? { dangerouslySetInnerHTML: { __html: internalCode } }
        : { children: internalCode }
      )}
    />
  );
};

export default PlainOutput;
