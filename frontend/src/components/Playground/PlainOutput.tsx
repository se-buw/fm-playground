import React, { useState, useEffect } from 'react';
import '../../assets/style/Playground.css'
import { useAtom } from 'jotai';
import { outputAtom } from '@/atoms';



const PlainOutput = () => {
  const [code, setCode] = useAtom(outputAtom);



  return (
    <pre
      id='info'
      className='plain-output-box'
      contentEditable={false}
      style={{
        borderRadius: '8px',
        height: '100%',
        whiteSpace: 'pre-wrap'
      }}
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
};

export default PlainOutput;
