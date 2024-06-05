import React from 'react';
import { MDBFooter } from 'mdb-react-ui-kit';
import '../../assets/style/Footer.css';

/**
 * Display the footer.
 * @returns 
 */
const Footer = () => {
  return (
    <MDBFooter  className='text-center text-lg-left mt-5'>
      <div className='text-center p-3 footer-text'>
      Privacy Policy: 
      This website logs the specifications and options, which may be analyzed and made public for research purposes. 
      Do not share confidential information.
      <br />
      Unless you login, it does not collect any personally identifiable information. 
      Deleting your profile will remove all records of your profile from our servers.
      The specifications will be unlinked from your profile, but remain on the servers (see first bullet). 
      <br />
        &copy; {new Date().getFullYear()} Copyright:{' '}
        Made with ♥ in Bauhaus-Universität Weimar
      </div>
    </MDBFooter>
  );
}

export default Footer;