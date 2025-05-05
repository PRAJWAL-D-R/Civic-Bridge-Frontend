import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Dropdown from 'react-bootstrap/Dropdown';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import Spinner from 'react-bootstrap/Spinner';
import Footer from './FooterC';
import logo from '../../Images/logo.png';
import './SignUp.css';

const SignUp = () => {
   const navigate = useNavigate();
   const [isLoading, setIsLoading] = useState(false);
   const [showToast, setShowToast] = useState(false);
   const [toastMessage, setToastMessage] = useState('');
   const [toastType, setToastType] = useState('success');

   const formik = useFormik({
      initialValues: {
         name: '',
         email: '',
         password: '',
         phone: '',
         userType: ''
      },
      validationSchema: Yup.object({
         name: Yup.string().matches(/^[A-Za-z ]+$/, 'Only alphabets are allowed').min(3, 'Name must be at least 3 characters').required('Full Name is required'),
         email: Yup.string().matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Only Gmail accounts with .com extension are allowed').required('Email is required'),
         password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
         phone: Yup.string().matches(/^\d{10}$/, 'Phone number must be 10 digits').required('Phone number is required'),
         userType: Yup.string().required('User type is required')
      }),
      onSubmit: async (values) => {
         setIsLoading(true);
         try {
            // First check if the email already exists
            const checkEmailResponse = await axios.post("https://civic-bridge-backend-1.onrender.com/checkEmail", { email: values.email });
            
            if (checkEmailResponse.data.exists) {
               // Email already exists
               setToastType('error');
               setToastMessage('This email address is already registered. Please use a different email or login.');
               setShowToast(true);
               setIsLoading(false);
               return;
            }
            
            // If email doesn't exist, proceed with registration
            await axios.post("https://civic-bridge-backend-1.onrender.com/SignUp", values);
            setToastType('success');
            setToastMessage('Account created successfully! Redirecting to login...');
            setShowToast(true);
            
            // Reset form after successful submission
            formik.resetForm();
            
            // Redirect to login page after a short delay
            setTimeout(() => {
               navigate('/login');
            }, 2000);
         } catch (error) {
            console.error(error);
            
            // Handle specific error for email already exists from backend
            if (error.response?.data?.code === 'EMAIL_EXISTS') {
               setToastType('error');
               setToastMessage('This email address is already registered. Please use a different email or login.');
            } else {
               setToastType('error');
               setToastMessage(error.response?.data?.message || 'Failed to create account. Please try again.');
            }
            
            setShowToast(true);
         } finally {
            setIsLoading(false);
         }
      }
   });

   return (
      <div className="signup-page">
         <Navbar bg="transparent" variant="light" className="custom-navbar">
            <Container>
               <Navbar.Brand>
                  <img 
                     src={logo}  
                     alt="Logo" 
                     width="40"  
                     height="40"
                     className="d-inline-block align-top me-2"
                  />
                  <span className="brand-text text-white">Civic-Bridge</span>
               </Navbar.Brand>
               <ul className="navbar-nav">
                  <li className="nav-item"><Link to={'/'} className="nav-link">Home</Link></li>
                  <li className="nav-item"><Link to={'/signup'} className="nav-link active">SignUp</Link></li>
                  <li className="nav-item"><Link to={'/login'} className="nav-link">Login</Link></li>
               </ul>
            </Container>
         </Navbar>
         
         <div className="form-container">
            <div className="card-overlay">
               <div className="card-content">
                  <h2 className="title">Create Your Account</h2>
                  <p className="subtitle">Join Civic-Bridge to register complaints and track their progress</p>
                  
                  <form onSubmit={formik.handleSubmit}>
                     <div className="form-group">
                        <label>Full Name</label>
                        <input 
                           type="text" 
                           name="name" 
                           placeholder="Enter your full name" 
                           className={`form-input ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                           {...formik.getFieldProps('name')} 
                        />
                        {formik.touched.name && formik.errors.name ? 
                           <div className="error-message">{formik.errors.name}</div> : null}
                     </div>
                     
                     <div className="form-group">
                        <label>Email</label>
                        <input 
                           type="email" 
                           name="email" 
                           placeholder="Enter your Gmail address" 
                           className={`form-input ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                           {...formik.getFieldProps('email')} 
                        />
                        {formik.touched.email && formik.errors.email ? 
                           <div className="error-message">{formik.errors.email}</div> : null}
                     </div>
                     
                     <div className="form-group">
                        <label>Password</label>
                        <input 
                           type="password" 
                           name="password" 
                           placeholder="Create a password" 
                           className={`form-input ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                           {...formik.getFieldProps('password')} 
                        />
                        {formik.touched.password && formik.errors.password ? 
                           <div className="error-message">{formik.errors.password}</div> : null}
                     </div>
                     
                     <div className="form-group">
                        <label>Mobile No.</label>
                        <input 
                           type="text" 
                           name="phone" 
                           placeholder="Enter your 10-digit phone number" 
                           className={`form-input ${formik.touched.phone && formik.errors.phone ? 'is-invalid' : ''}`}
                           {...formik.getFieldProps('phone')} 
                        />
                        {formik.touched.phone && formik.errors.phone ? 
                           <div className="error-message">{formik.errors.phone}</div> : null}
                     </div>
                     
                     <div className="form-group">
                        <label>Select User Type</label>
                        <Dropdown className="custom-dropdown">
                           <Dropdown.Toggle variant="light" className="dropdown-toggle">
                              {formik.values.userType || "Select User Type"}
                           </Dropdown.Toggle>
                           <Dropdown.Menu>
                              <Dropdown.Item onClick={() => formik.setFieldValue('userType', 'Ordinary')}>Ordinary</Dropdown.Item>
                              <Dropdown.Item onClick={() => formik.setFieldValue('userType', 'Agent')}>Agent</Dropdown.Item>
                           </Dropdown.Menu>
                        </Dropdown>
                        {formik.touched.userType && formik.errors.userType ? 
                           <div className="error-message">{formik.errors.userType}</div> : null}
                     </div>
                     
                     <button className="submit-button" type="submit" disabled={isLoading}>
                        {isLoading ? (
                           <span className="loading-wrapper">
                              <Spinner animation="border" size="sm" className="spinner" />
                              <span className="loading-text">Creating Account...</span>
                           </span>
                        ) : (
                           'Create Account'
                        )}
                     </button>
                  </form>
                  
                  <p className="login-link">
                     Already have an account? <Link to={'/Login'}>Log in</Link>
                  </p>
               </div>
            </div>
         </div>
         
         <ToastContainer position="top-end" className="p-3 toast-container">
            <Toast 
               show={showToast} 
               onClose={() => setShowToast(false)} 
               delay={5000} 
               autohide 
               className={`custom-toast ${toastType}-toast`}
            >
               <Toast.Header closeButton>
                  <strong className="me-auto">
                     {toastType === 'success' ? 'Success' : 'Error'}
                  </strong>
               </Toast.Header>
               <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>
         </ToastContainer>
         
         <Footer />
      </div>
   );
};

export default SignUp;