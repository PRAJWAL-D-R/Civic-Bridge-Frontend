import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Footer from './FooterC';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../Images/logo.png';
import { ClipLoader } from 'react-spinners';
import './Login.css';

const Login = () => {
   const navigate = useNavigate();
   const [user, setUser] = useState({ email: '', password: '' });
   const [loading, setLoading] = useState(false);
   const [rememberMe, setRememberMe] = useState(false);

   useEffect(() => {
      const savedEmail = localStorage.getItem('rememberedEmail');
      if (savedEmail) {
         setUser(prev => ({ ...prev, email: savedEmail }));
         setRememberMe(true);
      }
      
      return () => {
         setUser({ email: '', password: '' });
         setLoading(false);
      };
   }, []);

   const handleChange = (e) => {
      const { name, value } = e.target;
      setUser((prevUser) => ({ ...prevUser, [name]: value }));
   };

   const handleRememberMe = () => {
      setRememberMe(!rememberMe);
   };

   const validateForm = () => {
      if (!user.email || !user.password) {
         toast.error('Please fill in all fields');
         return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
         toast.error('Please enter a valid email address');
         return false;
      }
      return true;
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setLoading(true);

      if (rememberMe) {
         localStorage.setItem('rememberedEmail', user.email);
      } else {
         localStorage.removeItem('rememberedEmail');
      }

      try {
         const response = await axios.post(
            'https://civic-bridge-backend-1.onrender.com/Login',
            user,
            {
               withCredentials: true,
               headers: { 'Content-Type': 'application/json' }
            }
         );

         if (response.data) {
            const { userType, _id, name } = response.data;
            
            toast.success('🎉 Successfully logged in!', {
               position: "top-right",
               autoClose: 2000,
               hideProgressBar: false,
               closeOnClick: true,
               pauseOnHover: true,
               draggable: true,
               progress: undefined,
            });

            const userData = { userType, _id, name }; 
            localStorage.setItem('user', JSON.stringify(userData));

            setTimeout(() => {
               switch (userType) {
                  case 'Admin':
                     navigate('/AdminHome');
                     break;
                  case 'Ordinary':
                     navigate('/HomePage');
                     break;
                  case 'Agent':
                     navigate('/AgentHome');
                     break;
                  default:
                     navigate('/Login');
                     break;
               }
            }, 1000);
         }
      } catch (error) {
         if (error.response) {
            toast.error(error.response.data.message || 'Invalid credentials. Please try again.', {
               position: "top-right",
               autoClose: 5000,
               hideProgressBar: false,
               closeOnClick: true,
               pauseOnHover: true,
               draggable: true,
               progress: undefined,
            });
         } else if (error.request) {
            toast.error('No response from server. Please check your network.', {
               icon: "🔌",
               theme: "colored"
            });
         } else {
            toast.error('An error occurred. Please try again later.', {
               theme: "colored"
            });
         }
      } finally {
         setLoading(false);
      }
   };

   return (
      <>
         <Navbar >
            <Container>
               <Navbar.Brand>
                  <img 
                     src={logo}  
                     alt="Logo" 
                     width="40"  
                     height="40"
                     className="d-inline-block align-top me-2"
                  />
                  <span >Civic-Bridge</span>
               </Navbar.Brand>
               <ul className="navbar-nav me-auto">
                  <li className="nav-item">
                     <Link to="/" className="nav-link text-dark">
                        Home
                     </Link>
                  </li>
                  <li className="nav-item">
                     <Link to="/signup" className="nav-link text-dark">
                        SignUp
                     </Link>
                  </li>
                  <li className="nav-item">
                     <Link to="/login" className="nav-link text-dark fw-bold">
                        Login
                     </Link>
                  </li>
               </ul>
               <Button
                  variant="outline-primary"
                  onClick={() => navigate('/adminlogin')}
                  disabled={loading}
                  className="rounded-pill px-4"
               >
                  Login as Admin
               </Button>
            </Container>
         </Navbar>

         <div className="login-container">
            <div className="container py-5 h-100">
               <div className="row d-flex justify-content-center align-items-center h-100">
                  <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                     <div className="card text-dark login-card">
                        <div className="card-body p-5 text-center">
                           <h2 className="fw-bold mb-3 text-primary">Welcome Back!</h2>
                           <p className="text-muted mb-4">Enter your credentials to continue</p>
                           <form onSubmit={handleSubmit}>
                              <div className="form-floating mb-4">
                                 <input
                                    type="email"
                                    name="email"
                                    id="emailInput"
                                    value={user.email}
                                    onChange={handleChange}
                                    className="form-control form-control-lg login-input"
                                    placeholder="Enter your email"
                                    required
                                    disabled={loading}
                                 />
                                 <label htmlFor="emailInput">Email address</label>
                              </div>
                              
                              <div className="form-floating mb-4">
                                 <input
                                    type="password"
                                    name="password"
                                    id="passwordInput"
                                    value={user.password}
                                    onChange={handleChange}
                                    className="form-control form-control-lg login-input"
                                    placeholder="Enter your password"
                                    required
                                    disabled={loading}
                                 />
                                 <label htmlFor="passwordInput">Password</label>
                              </div>
                              
                              <div className="form-check d-flex justify-content-start mb-4">
                                 <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    id="rememberMe" 
                                    checked={rememberMe}
                                    onChange={handleRememberMe}
                                 />
                                 <label className="form-check-label ms-2" htmlFor="rememberMe">
                                    Remember my email
                                 </label>
                              </div>

                              <button
                                 className="btn btn-primary btn-lg px-5 w-100 login-btn"
                                 type="submit"
                                 disabled={loading}
                              >
                                 {loading ? (
                                    <span>
                                       <ClipLoader size={20} color="#fff" /> Logging in...
                                    </span>
                                 ) : (
                                    'Sign In'
                                 )}
                              </button>
                           </form>
                           
                           <p className="mt-3 text-muted">
                              Don't have an account?{' '}
                              <Link to="/SignUp" className="text-primary fw-bold">
                                 Create Account
                              </Link>
                           </p>
                       
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <Footer />
         <ToastContainer position="top-right" theme="colored" />
      </>
   );
};

export default Login;
