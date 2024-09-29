import {useState } from 'react'
import { useIdleTimer } from 'react-idle-timer'
import {
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
} from 'mdb-react-ui-kit';

import { useAuth } from '../../../contexts/AuthContext';

const SessionExpiredModal = () => {
  const [timeoutModal, setTimeoutModal] = useState(false);
  const [state, setState] = useState('Active')
  const { isLoggedIn } = useAuth();

  const handleIdle = () => {
    setTimeoutModal(false)
    window.location.reload()
  }

  const onIdle = () => {
    setState('Idle')
    setTimeoutModal(true)
  }

  const {
  } = useIdleTimer({
    onIdle,
    timeout: 3600 * 1000,
    crossTab: true,
    leaderElection: true,
    syncTimers: 200
  })

  return (
    <>
     {state === 'Idle' && isLoggedIn && (
        <MDBModal
          open={timeoutModal}
          tabIndex="-1"
        >
          <MDBModalDialog>
            <MDBModalContent className="message-modal-content">
              <MDBModalHeader className="bg-primary text-white">
                <MDBModalTitle>Session Timeout</MDBModalTitle>
                <MDBBtn
                  className="btn-close btn-close-white"
                  color="none"
                  onClick={handleIdle}
                ></MDBBtn>
              </MDBModalHeader>
              <MDBModalBody className='text-center'>
                <h5> Your login session has expired due to inactivity⌛</h5>
                <h5> Please login again.</h5>
                <h5> Don't worry, your code is saved!</h5>
              </MDBModalBody>

              <MDBModalFooter>
                <MDBBtn color="secondary" onClick={handleIdle}>
                  OK
                </MDBBtn>
              </MDBModalFooter>
            </MDBModalContent>
          </MDBModalDialog>
        </MDBModal>
      )}
    </>
  )
}


export default SessionExpiredModal;