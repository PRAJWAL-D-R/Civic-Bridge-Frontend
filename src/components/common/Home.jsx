import React from 'react'
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import tumkur from '../../Images/tumkur.png';
import logo from '../../Images/logo.png';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Footer from './FooterC'
import '../common/Home.css'

const Home = () => {
   return (
      <>
         <Navbar bg="dark" variant="dark">
            <Container>
            <Navbar.Brand>
                  <img 
                     src={logo}  
                     alt="Logo" 
                     width="40"  
                     height="40"
                     className="d-inline-block align-top me-2"
                  />
               Civic-Bridge</Navbar.Brand>
               <ul className="navbar-nav">
                  <li className="nav-item mb-2">
                     <Link to={'/'}
                        className={`nav-link text-light `}
                     >
                        Home
                     </Link>
                  </li>
                  <li className="nav-item mb-2">
                     <Link
                     to={'/signup'}
                        className={`nav-link text-light `}
                     >
                        SignUp
                     </Link>
                  </li>
                  <li className="nav-item mb-2">
                     <Link
                     to={'/login'}
                        className={`nav-link text-light `}
                     >
                        Login
                     </Link>
                  </li>
               </ul>
            </Container>
         </Navbar>
         <Container className='home-container'>
            <div className="left-side">
               <img src={tumkur} alt="" />
            </div>
            <div className="right-side">
               <p>
                  <span className='f-letter' align>Grievance-Portal</span><br />
                  <span className='p-letter'>"Your Voice, Your Rights" </span><br />

                  <span className='s-letter'> Bridging the Gap Between Citizens and Government.</span> <br />
                  <span className='t-letter'>Complaint Management Solution</span><br />
                  <Link to={'/Login'}><Button className='mt-3 register'>Register your Compliant</Button></Link>
               </p>
            </div>
         </Container>
         <Footer/>
      </>
   )
}

export default Home
