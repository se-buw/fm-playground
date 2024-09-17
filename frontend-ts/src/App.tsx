// import { useState } from 'react'
import './App.css'
import { getTitle } from './config'
import Tools from './components/Playground/Tools'
import PlaygroundEditor from './components/Playground/MonacoEditorWithoutLSP';

function App() {
  const title = getTitle();
  return (
    <>
      <h1>{title.title}</h1>
      <Tools />
      <PlaygroundEditor editorValue="// Your code here" lineToHighlight={[]} language={{ id: "javascript" }} />
    </>
  )
}

export default App
