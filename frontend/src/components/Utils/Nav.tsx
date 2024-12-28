import React, { useContext, useState } from 'react';
import { useAtom } from 'jotai';
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
  MDBDropdownItem,
} from 'mdb-react-ui-kit';
import { FaGithub } from 'react-icons/fa';
import AuthContext from '@/contexts/AuthContext';
import DrawerComponent from '@/components/Utils/DrawerComponent';
import CustomSnackbar from '@/components/Utils/Modals/CustomSnackbar';
import ConfirmModal from '@/components/Utils/Modals/ConfirmModal';
import { downloadUserData, deleteProfile } from '@/api/playgroundApi';
import axiosAuth from '@/api/axiosAuth';
import SessionExpiredModal from '@/components/Utils/Modals//SessionExpiredModal';
import Toggle from '@/components/Utils/Toggle';
import { editorValueAtom, languageAtom } from '@/atoms';
import { fmpConfig } from '@/components/Playground/ToolMaps';
import '@/assets/style/Nav.css';

interface NavbarProps {
  isDarkTheme: boolean;
  setIsDarkTheme: (value: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDarkTheme, setIsDarkTheme }) => {
  const [, setEditorValue] = useAtom(editorValueAtom);
  const [, setLanguage] = useAtom(languageAtom);
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const authContext = useContext(AuthContext);
  const isLoggedIn = authContext?.isLoggedIn ?? false;
  const setIsLoggedIn = authContext?.setIsLoggedIn ?? (() => {});
  const [openNavRight, setOpenNavRight] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleLogout() {
    axiosAuth
      .get(`${import.meta.env.VITE_FMP_API_URL}/logout`)
      .then((_res) => {
        setIsLoggedIn(false);
        setSnackbarMessage('Logout successful');
      })
      .catch((err) => {
        console.log(err);
      });
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
          const user = res.email;
          const history = res.data;
          const data = { user, history };
          const url = window.URL.createObjectURL(new Blob([JSON.stringify(data)]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${user}.json`);
          document.body.appendChild(link);
          link.click();
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleUserProfileDelete = async () => {
    try {
      await deleteProfile()
        .then((res) => {
          console.log(res);
          setIsLoggedIn(false);
        })
        .catch((err) => {
          console.log(err);
        });
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
   * @param {*} check  - The short name of the tool.
   * @param {*} permalink - The for the specification.
   * @param {*} code - Specification code.
   */
  const handleDrawerItemClick = (check: string, permalink: string, code: string) => {
    setEditorValue(code);
    const options = Object.entries(fmpConfig.tools).map(([key, tool]) => ({
      id: key,
      value: tool.extension,
      label: tool.name,
      short: tool.shortName,
    }));
    const selectedOption = options.find((option) => option.short === check);
    if (selectedOption) {
      setLanguage(selectedOption);
    }
    window.history.pushState(null, '', `/?check=${check}&p=${permalink}`);
    const info = document.getElementById('info');
    if (info) {
      info.innerText = '';
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className='Nav'>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title='Delete Profile'
        message={`This is a destructive action. This will unlink all specifications from your history (this information will be lost forever).
        Are you sure you want to delete your profile?`}
        onConfirm={handleUserProfileDelete}
      />
      <SessionExpiredModal />
      <header className='fixed-top header'>
        <MDBNavbar expand='lg'>
          <MDBContainer>
            <MDBNavbarBrand href={window.location.origin}>
              <h2 className='bold header'>FM Playground</h2>
            </MDBNavbarBrand>

            {isMobile && <Toggle isDarkTheme={isDarkTheme} setIsDarkTheme={setIsDarkTheme} />}

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
                      className='navbar-option-button'
                      onClick={handleDrawerOpen}
                      style={{ width: 'auto', display: 'flex', alignItems: 'center' }}
                    >
                      History
                    </MDBBtn>
                    <DrawerComponent
                      isOpen={isDrawerOpen}
                      onClose={handleDrawerClose}
                      onItemSelect={handleDrawerItemClick}
                    />
                    <MDBDropdown
                      className='btn-group navbar-option-button'
                      style={{ width: 'auto', display: 'flex', alignItems: 'center' }}
                    >
                      <MDBBtn color='danger' onClick={handleLogout}>
                        Logout
                      </MDBBtn>
                      <MDBDropdownToggle split color='dark' style={{ flex: '0' }}></MDBDropdownToggle>
                      <MDBDropdownMenu style={{ minWidth: '200px' }}>
                        <MDBDropdownItem link onClick={handleUserDataDownload}>
                          Download Your Data
                        </MDBDropdownItem>
                        <MDBDropdownItem link onClick={openModal}>
                          Delete Profile
                        </MDBDropdownItem>
                      </MDBDropdownMenu>
                    </MDBDropdown>
                  </>
                ) : (
                  <MDBBtn rounded color='primary' href='/login'>
                    Login
                  </MDBBtn>
                )}

                {isMobile && (
                  <button
                    color='navbar-option-button'
                    onClick={() => window.open('https://github.com/se-buw/fm-playground', '_blank')}
                    style={{ backgroundColor: 'transparent', border: 'none', display: 'flex', alignItems: 'center' }}
                  >
                    <FaGithub size={24} />
                  </button>
                )}
              </MDBNavbarNav>
            </MDBCollapse>
          </MDBContainer>
          {/* FIXME: Enable Dark mode once moved all the LSP */}
          {/* <div className='toggle-icon'>
            <Toggle isDarkTheme={isDarkTheme} setIsDarkTheme={setIsDarkTheme} />
          </div> */}
          <FaGithub
            size={40}
            className='github-icon'
            onClick={() => window.open('https://github.com/se-buw/fm-playground', '_blank')}
            style={{ marginRight: '20px' }}
            role='button'
          />
        </MDBNavbar>
        <CustomSnackbar message={snackbarMessage} onClose={handleSnackbarClose} />
      </header>
    </div>
  );
};

export default Navbar;
