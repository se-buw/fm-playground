import React from 'react';
import CopyToClipboardBtn from './CopyToClipboardBtn';

/**
 * Display the permalink after tool execution.
 * @todo: Not used anymore. Check if it can be removed.
 * @param {*} permalink
 * @returns 
 */
const PermalinkVisualization = ({ permalink }) => {
  return (
    <div className='col-md-12 mb-2'>
      {permalink !== '' ? (
        <div className='card shadow-4'>
          <div className='card-body d-flex justify-content-between align-items-center p-2'>
            <code>{`http://localhost:5173/?check=${permalink.check}&p=${permalink.permalink}`}</code>
            <CopyToClipboardBtn textToCopy={`http://localhost:5173/?check=${permalink.check}&p=${permalink.permalink}`} />
          </div>
        </div>
      ) : (
        <div className='d-flex justify-content-center'>
          {/* Add any placeholder or message for when permalink is not available */}
          <p>No permalink available</p>
        </div>
      )}
    </div>
  );
};

export default PermalinkVisualization;
