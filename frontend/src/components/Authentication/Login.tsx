import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBIcon
} from 'mdb-react-ui-kit';
import '@/assets/style/Login.css';

function Login() {
  function handleGoogleLogin() {
    window.open(`${import.meta.env.VITE_FMP_API_URL}/login/google`, '_self')
  }

  function handleGithubLogin() {
    window.open(`${import.meta.env.VITE_FMP_API_URL}/login/github`, '_self')
  }
  return (
    <MDBContainer className='d-flex justify-content-center align-items-center' style={{ height: '100vh' }}>
      <MDBCard className='log-in-card'>
        <div className='text-center mt-3'>
          <img src='logo_se.png' alt='SE Logo' className="logo" />
        </div>
        <h5 className='mx-auto mt-3'>Login with your identity provider</h5>
        <hr />
        <MDBCardBody className='py-2 text-center'>
          <MDBBtn
            className='google-btn'
            onClick={handleGoogleLogin}
          >
            <MDBIcon className='me-2' fab icon='google' /> Login with Google
          </MDBBtn>
          <br />
          <br />
          <MDBBtn
            className='github-btn '
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