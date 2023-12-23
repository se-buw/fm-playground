import React, { useContext } from 'react';
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBIcon
}
  from 'mdb-react-ui-kit';
import AuthContext from '../../contexts/AuthContext';

function Login() {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);


  function handleGoogleLogin() {
    window.open(`${import.meta.env.VITE_FMP_API_URL}/login/google`, '_self')
  }

  function handleGithubLogin() {
    window.open(`${import.meta.env.VITE_FMP_API_URL}/login/github`, '_self')
  }
  return (
    <MDBContainer className='d-flex justify-content-center align-items-center' style={{ height: '100vh' }}>
      <MDBCard className='shadow-5' style={{ width: '25rem' }}>
        <div className='text-center mt-3'>
          <img src='logo_se.png' alt='SE Logo' style={{ width: '75px', height: '75px' }} />
        </div>
        <h5 className='mx-auto mt-3'>Login with your identity provider</h5>

        <MDBCardBody className='p-5 py-4 shadow-5 text-center'>
          <MDBBtn
            style={{ backgroundColor: '#dd4b39' }}
            onClick={handleGoogleLogin}
          >
            <MDBIcon className='me-2' fab icon='google' /> Login with Google
          </MDBBtn>
          <br />
          <br />
          <MDBBtn
            style={{ backgroundColor: '#000000' }}
            onClick={handleGithubLogin}
          >
            <MDBIcon className='me-2' fab icon='github' /> Login with Github
          </MDBBtn>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
}

export default Login;