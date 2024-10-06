import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Nav from './components/Utils/Nav'
import Footer from './components/Utils/Footer'
import Playground from './components/Playground/Playground'
import Login from './components/Authentication/Login'
import ProtectedRoutes from './components/Authentication/ProtectedRoutes'
import Missing from './components/Utils/Missing'
import Options from './assets/config/AvailableTools'
import './assets/style/index.css'
import '../src/assets/style/App.css'
import { LanguageProps } from './components/Playground/Tools'
import MaintenanceSnackbar from './components/Utils/Modals/MaintenanceSnackbar'

const App = () => {
  const [editorValue, setEditorValue] = useState(localStorage.getItem('editorValue') || '');
  const [language, setLanguage] = useState(JSON.parse(localStorage.getItem('language') || 'null') || Options[1]);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const storedTheme = localStorage.getItem('isDarkTheme');
    return storedTheme === 'true';
  });
  const [editorTheme, setEditorTheme] = useState(() => {
    const storedTheme = localStorage.getItem('editorTheme');
    return storedTheme || 'vs';
  });

  const handleEditorValueChange = (code: string) => {
    setEditorValue(code);
  };
  const handleLanguageChange = (newLanguage: LanguageProps) => {
    setLanguage(newLanguage)
  }

  const handleToggleTheme = () => {
    setIsDarkTheme((prevIsDarkTheme) => {
      const newTheme = !prevIsDarkTheme;
      localStorage.setItem('isDarkTheme', newTheme.toString());
      return newTheme;
    });
  };


  useEffect(() => {
    localStorage.setItem('editorValue', editorValue);
  }, [editorValue]);

  useEffect(() => {
    localStorage.setItem('language', JSON.stringify(language));
  }, [language]);

  useEffect(() => {
    localStorage.setItem('isDarkTheme', isDarkTheme ? 'true' : 'false');
    const theme = isDarkTheme ? 'dark' : 'light';
    if (theme === 'dark') {
      setEditorTheme('vs-dark');
      localStorage.setItem('editorTheme', 'vs-dark');
    } else {
      setEditorTheme('vs');
      localStorage.setItem('editorTheme', 'vs');
    }
    document.documentElement.setAttribute('data-theme', theme);
  }, [isDarkTheme]);


  return (
    <AuthProvider>
      <div className='App' data-theme={isDarkTheme ? 'dark' : 'light'}>
        <Nav
          setEditorValue={setEditorValue}
          setLanguage={setLanguage}
          isDarkTheme={isDarkTheme}
          setIsDarkTheme={setIsDarkTheme}
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
              editorTheme={editorTheme}
            />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Missing />} />
          </Routes>
        </Router>

        <MaintenanceSnackbar />

        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App