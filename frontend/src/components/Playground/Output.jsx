import React from 'react';
import CodeDisplay from './PlainOutput'; 

const App = () => {
  const exampleCode = "";

  return (
    <div>
      <CodeDisplay 
      code={exampleCode} />
    </div>
  );
};

export default App;
