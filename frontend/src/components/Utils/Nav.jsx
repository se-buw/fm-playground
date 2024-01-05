import React, { useContext, useState } from 'react';
import {
  MDBContainer,
  MDBNavbar,
  MDBNavbarBrand,
  MDBBtn,
  MDBNavbarNav,
  MDBNavbarToggler,
  MDBIcon,
  MDBCollapse,
  MDBDropdown,
  MDBDropdownMenu,
  MDBDropdownToggle,
  MDBDropdownItem

} from 'mdb-react-ui-kit';
import AuthContext from '../../contexts/AuthContext';
import { FaGithub } from 'react-icons/fa'
import DrawerComponent from './DrawerComponent';
import Options from '../../assets/config/AvailableTools.js'
import CustomSnackbar from './Modals/CustomSnackbar.jsx';
import ConfirmModal from './Modals/ConfirmModal.jsx';
import { downloadUserData, deleteProfile } from '../../api/playgroundApi.js';
import axiosAuth from '../../api/axiosAuth.js';

/**
 * Display the header and navigation bar.
 * @param {*} setEditorValue - The callback function to set the code in the Editor.
 * @param {*} setLanguage - The callback function to set the language in the Editor. 
 * @returns 
 */
export default function Navbar({ setEditorValue, setLanguage }) {
  const isMobile = window.innerWidth = window.matchMedia('(max-width: 767px)').matches;
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const [openNavRight, setOpenNavRight] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Handle the logout button.
   * @returns
   */
  function handleLogout() {
    const res = axiosAuth.get(`${import.meta.env.VITE_FMP_API_URL}/logout`)
      .then((res) => {
        setIsLoggedIn(false)
        setSnackbarMessage('Logout successful');
      })
      .catch((err) => {
        console.log(err)
      })
  }

  /**
   * Fetch the user history from the API.
   * @todo: This function is moved to DrawerComponent.jsx.  Remove this function if it's not used anywhere else.
   * @param {*} pageNumber 
   */
  const handleUserDataDownload = async () => {
    try {
      await downloadUserData()
        .then((res) => {
          const user = res.email
          const history = res.data
          const data = { user, history }
          const url = window.URL.createObjectURL(new Blob([JSON.stringify(data)]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${user}.json`);
          document.body.appendChild(link);
          link.click();
        })
        .catch((err) => {
          console.log(err)
        })
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleUserProfileDelete = async () => {
    try {

      await deleteProfile()
        .then((res) => {
          console.log(res)
          setIsLoggedIn(false)
        })
        .catch((err) => {
          console.log(err)
        })
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarMessage('');
  };

  /**
   * Handle the drawer item click. Update the state in the Playground component to set the code in the Editor
   * @param {*} check 
   * @param {*} code 
   */
  const handleDrawerItemClick = (check, code) => {
    setEditorValue(code);
    setLanguage(Options.find(option => option.short === check));
    // Clean the output area when a new item is loaded from the history. 
    // FIXME: Better approach would be to handle this using useState hook in the Output component.
    //But limboole is setting the output from web-assembly. We need to handle this when we refactor the code for Alloy.
    const info = document.getElementById("info");
    info.innerText = "";
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title='Delete Profile'
        message={`This is a destructive action. This will unlink all specifications from your history (this information will be lost forever).
        Are you sure you want to delete your profile?`}
        onConfirm={handleUserProfileDelete}
      />
      <header className='fixed-top'>
        <MDBNavbar expand='lg' light bgColor='light'>
          <MDBContainer >
            <MDBNavbarBrand href={window.location.origin}>
              <h2 className='bold'>FM Playground</h2>
            </MDBNavbarBrand>

            <MDBNavbarToggler
              type='button'
              aria-expanded='false'
              aria-label='Toggle navigation'
              onClick={() => setOpenNavRight(!openNavRight)}
            >
              <MDBIcon icon='bars' fas />
            </MDBNavbarToggler>


            <MDBCollapse navbar open={openNavRight}>

              <MDBNavbarNav right fullWidth={false} className='mb-2 mb-lg-0'>
                {isLoggedIn ? (
                  <>
                    <MDBBtn
                      className='mb-2 mb-lg-0 me-lg-2 justify-content-center'
                      onClick={handleDrawerOpen}
                      style={{ width: 'auto', display: 'flex', alignItems: 'center' }}
                    >History
                    </MDBBtn>
                    <DrawerComponent isOpen={isDrawerOpen} onClose={handleDrawerClose} onItemSelect={handleDrawerItemClick} />
                    <MDBDropdown className='btn-group' style={{ width: 'auto', display: 'flex', alignItems: 'center' }} >
                      <MDBBtn
                        color='danger'
                        onClick={handleLogout}
                      >
                        Logout
                      </MDBBtn>
                      <MDBDropdownToggle split color='dark' style={{ flex: '0' }}></MDBDropdownToggle>
                      <MDBDropdownMenu style={{ minWidth: '200px' }}>
                        <MDBDropdownItem
                          link
                          onClick={handleUserDataDownload}
                        >Download Your Data
                        </MDBDropdownItem>
                        <MDBDropdownItem
                          link
                          onClick={openModal}
                        >Delete Profile
                        </MDBDropdownItem>
                      </MDBDropdownMenu>
                    </MDBDropdown>
                  </>
                ) : (
                  <MDBBtn rounded color='primary' href='/login'>Login</MDBBtn>
                )}

                {isMobile && (
                  <MDBBtn
                    color='light'
                    onClick={() => window.open('https://github.com/se-buw/fm-playground', '_blank')}
                  ><FaGithub size={24} style={{ marginRight: '5px' }} />
                  </MDBBtn>
                )}
              </MDBNavbarNav>
            </MDBCollapse>

          </MDBContainer>
          <FaGithub
            size={40}
            className='github-icon'
            onClick={() => window.open('https://github.com/se-buw/fm-playground', '_blank')}
            style={{ marginRight: '20px' }}
            role='button'
          />
        </MDBNavbar>

        {/* Snackbar component */}
        <CustomSnackbar
          message={snackbarMessage}
          onClose={handleSnackbarClose}
        />
      </header>
    </div>
  );
}