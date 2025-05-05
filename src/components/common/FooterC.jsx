// FooterC.jsx
import React from 'react';
import { MDBFooter } from 'mdb-react-ui-kit';
import './FooterC.css';

export default function FooterC() {
  return (
    <MDBFooter className='footer-container'>
      <div className='footer-content'>
        <p className='footer-title'>Civic Bridge</p>
        <p className='footer-developers'>
          Developed by : <span className='developer-name'>Prajwal D R</span> &
          <span className='developer-name-alt'> Murali K L</span>
        </p>
        <p className='footer-year'>&copy; {new Date().getFullYear()}</p>
      </div>
    </MDBFooter>
  );
}