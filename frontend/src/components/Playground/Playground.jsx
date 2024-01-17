import React, { useState} from 'react'
import Editor from './Editor.jsx'
import { MDBBtn } from 'mdb-react-ui-kit';
import PlainOutput from './PlainOutput.jsx'
import { executeCmdTool } from '../../api/toolsApi.js'



const Playground = ({ editorValue, setEditorValue, language, setLanguage }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState('') // contains the output of the tool

  const handleToolExecution = async () => {
    setOutput('')
    try {
      setIsExecuting(true);

      executeCmdTool(editorValue)
        .then((res) => {
          setOutput(res.result)
          setIsExecuting(false);
        })
        .catch((err) => {
          console.log(err)
          setIsExecuting(false);
        })
    } catch (err) {
      console.log(err)
      setIsExecuting(false);
    }
  }


  /**
   * Update the output area with the code passed as a prop to the PlainOutput component.
   * @param {*} newCode 
   */
  const handleOutputChange = (newCode) => {
    setOutput(newCode);
  };

  return (
    <div className="container mt-5 pt-5">
      <div className="row">
        <div className="col-md-6" style={{ backgroundColor: 'white' }}>
          <div className='row'>
            <div className='col-md-12 mx-auto mb-2'>
              <div className='d-flex justify-content-between'>
                <div className='col-md-4'>
                  <h2>Input</h2>
                </div>

              </div>
            </div>
            <Editor
              height='60vh'
              setEditorValue={setEditorValue}
              editorValue={editorValue}
              language={language}
              setLanguage={setLanguage}
              theme='vs-dark'
            />
            <MDBBtn
              className='mx-auto my-3'
              style={{ width: '95%' }}
              color='primary'
              onClick={handleToolExecution}
              disabled={isExecuting}
            >
              {isExecuting ? 'Running...' : 'RUN'}
            </MDBBtn>
          </div>
        </div>
        <div className='col-md-6' style={{ backgroundColor: 'white' }}>
          <div className='row'>
            <div className='col-md-12'>
              <div className={`d-flex justify-content-between ${language.id !== 'xmv' ? 'mb-3' : ''}`}>
                <h2>Output</h2>
              </div>
            </div>
            <div className='col-md-12'>
              <PlainOutput
                code={output}
                height='60vh'
                onChange={handleOutputChange} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Playground