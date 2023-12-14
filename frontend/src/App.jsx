import React, { useState } from 'react'
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
import Dashboard from './components/User/Dashboard'

const App = () => {
  const [editorValue, setEditorValue] = useState('');
  const [language, setLanguage] = useState(Options[1])
  const handleEditorValueChange = (code) => {
    setEditorValue(code);
  };
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
  }
  return (
    <AuthProvider>

      <div>
        <Nav
          setEditorValue={setEditorValue}
          setLanguage={setLanguage}
        />
        <Router>
          <Routes>
            <Route element={<ProtectedRoutes />} >
              {/* <Route path="/dashboard" exact element={<Dashboard />} /> */}
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