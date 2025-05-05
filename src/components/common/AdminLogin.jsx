import axios from 'axios';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Footer from './FooterC';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Make sure this import is included
import { ClipLoader } from 'react-spinners';
import logo from '../../Images/logo.png';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import '../common/adminlogin.css';

const AdminLogin = () => {
   const navigate = useNavigate();

   const formik = useFormik({
      initialValues: {
         email: '',
         password: ''
      },
      validationSchema: Yup.object({
         email: Yup.string()
            .email('Invalid email address')
            .required('Required'),
         password: Yup.string()
            .required('Required')
      }),
      onSubmit: async (values, { setSubmitting }) => {
         try {
            const res = await axios.post("https://civic-bridge-backend-1.onrender.com/Login", values);

            const { userType } = res.data;

            if (userType !== "Admin") {
               toast.error("🚫 Access denied: Admin privileges required", { 
                  position: "top-center"
               });
               setSubmitting(false);
               return;
            }

            toast.success("✅ Admin login successful!", { 
               position: "top-center" 
            });
            
            localStorage.setItem("user", JSON.stringify(res.data));
            
            // Short delay to allow toast to be seen before navigation
            setTimeout(() => {
               navigate("/AdminHome");
            }, 1500);

         } catch (err) {
            if (err.response && err.response.status === 401) {
               toast.error("❌ Invalid credentials", { 
                  position: "top-center" 
               });
            } else {
               toast.error("⚠️ Login failed. Please try again.", { 
                  position: "top-center" 
               });
            }
         } finally {
            setSubmitting(false);
         }
      }
   });

   return (
      <div className="admin-page-wrapper">
         {/* Toast Container - simplified config */}
         <ToastContainer />

         {/* Navbar */}
         <Navbar bg="light" variant="light" expand="lg" className="navbar-transparent">
            <Container className="d-flex justify-content-between">
               <Navbar.Brand className="d-flex align-items-center">
                  <img src={logo} alt="Logo" width="40" height="40" className="me-2" />
                  Civic-Bridge
               </Navbar.Brand>
               <ul className="navbar-nav d-flex flex-row gap-3 align-items-center">
                  <li className="nav-item">
                     <Link to="/" className="nav-link text-dark">Home</Link>
                  </li>
                  <li className="nav-item">
                     <Link to="/signup" className="nav-link text-dark">SignUp</Link>
                  </li>
                  <li className="nav-item">
                     <Link to="/login" className="nav-link text-dark">Login</Link>
                  </li>
                  {/* <li className="nav-item">
                     <Button variant="outline-primary" onClick={() => navigate('/adminlogin')}>
                        Admin Login
                     </Button>
                  </li> */}
               </ul>
            </Container>
         </Navbar>

         {/* Admin Login Form */}
         <div className="login-content-container">
            <div className="container py-5 h-100">
               <div className="row d-flex justify-content-center align-items-center h-100">
                  <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                     <div className="card admin-card">
                        <div className="card-body p-5 text-center">
                           <div className="mb-md-5 mt-md-4 pb-5">
                              <h2 className="fw-bold mb-4">Admin Login</h2>
                              <p className="text-dark-50 mb-5">Please enter your admin credentials</p>
                              <form onSubmit={formik.handleSubmit}>
                                 <div className="form-outline form-dark mb-4 text-start">
                                    <label className="form-label">Email</label>
                                    <input 
                                       type="email" 
                                       name="email" 
                                       value={formik.values.email} 
                                       onChange={formik.handleChange} 
                                       onBlur={formik.handleBlur}
                                       className="form-control form-control-lg" 
                                    />
                                    {formik.touched.email && formik.errors.email && (
                                       <div className="text-danger">{formik.errors.email}</div>
                                    )}
                                 </div>
                                 <div className="form-outline form-dark mb-4 text-start">
                                    <label className="form-label">Password</label>
                                    <input 
                                       type="password" 
                                       name="password" 
                                       value={formik.values.password} 
                                       onChange={formik.handleChange} 
                                       onBlur={formik.handleBlur}
                                       className="form-control form-control-lg" 
                                       autoComplete="off" 
                                    />
                                    {formik.touched.password && formik.errors.password && (
                                       <div className="text-danger">{formik.errors.password}</div>
                                    )}
                                 </div>
                                 <button 
                                    className="btn btn-primary btn-lg px-5 w-100 mt-3 login-btn" 
                                    type="submit"
                                    disabled={formik.isSubmitting}
                                 >
                                    {formik.isSubmitting ? (
                                       <ClipLoader size={20} color="#ffffff" />
                                    ) : (
                                       'Login'
                                    )}
                                 </button>
                              </form>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Footer */}
         <Footer />
      </div>
   );
};

export default AdminLogin;