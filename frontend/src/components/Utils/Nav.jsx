import React from 'react';
import {
  MDBContainer,
  MDBNavbar,
  MDBNavbarBrand,
} from 'mdb-react-ui-kit';
import { FaGithub } from 'react-icons/fa'



/**
 * Display the header and navigation bar.
 * @param {*} setEditorValue - The callback function to set the code in the Editor.
 * @param {*} setLanguage - The callback function to set the language in the Editor. 
 * @returns 
 */
export default function Navbar({ setEditorValue, setLanguage }) {
  return (
    <div>
      <header className='fixed-top'>
        <MDBNavbar expand='lg' light bgColor='light'>
          <MDBContainer >
            <MDBNavbarBrand href={window.location.origin}>
              <h2 className='bold'>FM Playground</h2>
            </MDBNavbarBrand>

          </MDBContainer>
          <FaGithub
            size={40}
            className='github-icon'
            onClick={() => window.open('https://github.com/se-buw/fm-playground', '_blank')}
            style={{ marginRight: '20px' }}
            role='button'
          />
        </MDBNavbar>
      </header>
    </div>
  );
}