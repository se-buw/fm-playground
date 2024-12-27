import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Nav from './components/Utils/Nav'
import Footer from './components/Utils/Footer'
import Playground from './components/Playground/Playground'
import Login from './components/Authentication/Login'
import ProtectedRoutes from './components/Authentication/ProtectedRoutes'
import Missing from './components/Utils/Missing'
import Feedback from './components/Utils/Feedback';
import './assets/style/index.css'
import '../src/assets/style/App.css'
import '../src/assets/style/Feedback.css'
import { Provider as JotaiProvider } from 'jotai'
import { jotaiStore } from './atoms'

const App = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const storedTheme = localStorage.getItem('isDarkTheme');
    return storedTheme === 'true';
  });
  const [editorTheme, setEditorTheme] = useState(() => {
    const storedTheme = localStorage.getItem('editorTheme');
    return storedTheme || 'vs';
  });

  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  const toggleFeedbackForm = () => {
    setShowFeedback((prev) => !prev);
  };


  const handleToggleTheme = () => {
    setIsDarkTheme((prevIsDarkTheme) => {
      const newTheme = !prevIsDarkTheme;
      localStorage.setItem('isDarkTheme', newTheme.toString());
      return newTheme;
    });
  };

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
      <JotaiProvider store={jotaiStore}>
        <div className='App' data-theme={isDarkTheme ? 'dark' : 'light'}>
          <Nav
            isDarkTheme={isDarkTheme}
            setIsDarkTheme={setIsDarkTheme}
          />
          <Router>
            <Routes>
              <Route element={<ProtectedRoutes />} >
              </Route>
              <Route path="/" element={<Playground
                editorTheme={editorTheme}
              />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Missing />} />
            </Routes>
          </Router>
          <button className="floating-button" onClick={toggleFeedbackForm}>
            Feedback
          </button>
          {showFeedback && <Feedback toggleFeedback={toggleFeedbackForm} />}
          <Footer />
        </div>
      </JotaiProvider>
    </AuthProvider>
  )
}

export default App