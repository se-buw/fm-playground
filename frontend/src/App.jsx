import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './assets/style/index.css'

import { AuthProvider } from './contexts/AuthContext'
import Nav from './components/Utils/Nav'
import Footer from './components/Utils/Footer'
import Playground from './components/Playground/Playground'
import Login from './components/Authentication/Login'
import ProtectedRoutes from './components/Authentication/ProtectedRoutes'
import Missing from './components/Utils/Missing'
import Options from './assets/config/AvailableTools'
import '../src/assets/style/App.css'

const App = () => {
  const [editorValue, setEditorValue] = useState(localStorage.getItem('editorValue') || '');
  const [language, setLanguage] = useState(JSON.parse(localStorage.getItem('language')) || Options[1]);
  const handleEditorValueChange = (code) => {
    setEditorValue(code);
  };
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
  }

  useEffect(() => {
    localStorage.setItem('editorValue', editorValue);
  }, [editorValue]);

  useEffect(() => {
    localStorage.setItem('language', JSON.stringify(language));
  }, [language]);


  return (
    <AuthProvider>
      <div className='App' data-theme="dark">
        <Nav
          setEditorValue={setEditorValue}
          setLanguage={setLanguage}
        />
        <Router>
          <Routes>
            <Route element={<ProtectedRoutes />} >
            </Route>
            <Route path="/" element={<Playground
              editorValue={editorValue}
              setEditorValue={setEditorValue}
              language={language}
              setLanguage={setLanguage}
            />} />
            <Route path="/login" exact element={<Login />} />
            <Route path="*" element={<Missing />} />
          </Routes>
        </Router>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App