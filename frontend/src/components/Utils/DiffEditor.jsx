import { useState, useRef } from 'react'
import { DiffEditor} from '@monaco-editor/react';
import { MDBInput, MDBBtn } from 'mdb-react-ui-kit';
import axiosAuth from '../../api/axiosAuth';

import Options from '../../assets/config/AvailableTools';
import { limbooleConf, limbooleLang } from '../../assets/languages/limboole'
import { smt2Conf, smt2Lang, smt2ComplitionProvider } from '../../assets/languages/smt2'
import { nuxmvConf, nuxmvLang } from '../../assets/languages/nuxmv'
import { alloyConf, alloyLang } from '../../assets/languages/alloy'

/**
 * Display a diff editor with the two permalinks.
 * @todo: Probably we won't be using this component in the final version of the app.
 * @returns 
 */
const CustomDiffEditor = () => {
  const diffEditorRef = useRef(null);
  const [originalPermalink, setOriginalPermalink] = useState('');
  const [modifiedPermalink, setModifiedPermalink] = useState('');
  const [originalEditorValue, setOriginalEditorValue] = useState('');
  const [modifiedEditorValue, setModifiedEditorValue] = useState('');
  const [originalLanguage, setOriginalLanguage] = useState('limboole');
  const [modifiedLanguage, setModifiedLanguage] = useState('limboole');

  function handleEditorDidMount(editor, monaco) {
    diffEditorRef.current = editor;
    diffEditorRef.current.focus()
    // register limboole language
    monaco.languages.register({ id: 'limboole' })
    monaco.languages.setMonarchTokensProvider('limboole', limbooleLang)
    monaco.languages.setLanguageConfiguration('limboole', limbooleConf)

    // register smt2 language
    monaco.languages.register({ id: 'smt2' })
    monaco.languages.setMonarchTokensProvider('smt2', smt2Lang)
    monaco.languages.setLanguageConfiguration('smt2', smt2Conf)
    monaco.languages.registerCompletionItemProvider('smt2', smt2ComplitionProvider);

    // register nuxmv language
    monaco.languages.register({ id: 'xmv' })
    monaco.languages.setMonarchTokensProvider('xmv', nuxmvLang)
    monaco.languages.setLanguageConfiguration('xmv', nuxmvConf)

    // register alloy language
    monaco.languages.register({ id: 'als' })
    monaco.languages.setMonarchTokensProvider('als', alloyLang)
    monaco.languages.setLanguageConfiguration('als', alloyConf)
  }

  const handleDiffExecution =  async () => {
    try {
      const originalResponse = await axiosAuth.get(originalPermalink.replace('http://localhost:5173/', 'http://localhost:8000/api/permalink/'))
      const modifiedResponse = await axiosAuth.get(modifiedPermalink.replace('http://localhost:5173/', 'http://localhost:8000/api/permalink/'))
      setOriginalEditorValue(originalResponse.data.code)
      setModifiedEditorValue(modifiedResponse.data.code)
      try{
        setOriginalLanguage(Options.find(option => option.short === originalPermalink.split('check=')[1].split('&')[0]).id)
        setModifiedLanguage(Options.find(option => option.short === modifiedPermalink.split('check=')[1].split('&')[0]).id)
      }catch(err){
        alert('Empty or Invalid permalink')
      }
    }catch (err) {
      alert(err)
    }
  }

  return (
    <div className='container' style={{ marginTop: '100px' }}>
      <div className='row mb-2'>
        <div className='col-md-6 mb-2'>
          <MDBInput
            value={originalPermalink}
            onChange={(e) => setOriginalPermalink(e.target.value)}
            label='Original Permalink'
            id='original'
            type='text'
          />
        </div>
        <div className='col-md-6'>
        <MDBInput
            value={modifiedPermalink}
            onChange={(e) => setModifiedPermalink(e.target.value)}
            label='Modified Permalink'
            id='modified'
            type='text'
          />
        </div>
        <MDBBtn
          className='mx-auto my-3'
          style={{ width: '30%' }}
          color='primary'
          onClick={handleDiffExecution}
        >
          Show Diff
        </MDBBtn>
      </div>

      <DiffEditor
        height="50vh"
        language="limboole"
        original={originalEditorValue}
        modified={modifiedEditorValue}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          readOnly: true,
        }}
        originalLanguage={originalLanguage}
        modifiedLanguage={modifiedLanguage}
      />
    </div>
  )
}

export default CustomDiffEditor