// import { useState } from 'react'
import './App.css'
import { getTitle } from './config'
import Tools from './components/Playground/Tools'

function App() {
  const title = getTitle();
  return (
    <>
      <h1>{title.title}</h1>
      <Tools />
    </>
  )
}

export default App
