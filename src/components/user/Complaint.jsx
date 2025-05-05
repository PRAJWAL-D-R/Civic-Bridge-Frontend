import axios from 'axios';
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Complaint.css';

const Complaint = () => {
   const [imagePreview, setImagePreview] = useState([]);
   const [imageFile, setImageFile] = useState([]);
   const user = JSON.parse(localStorage.getItem('user'));

   const FILE_SIZE = 5 * 1024 * 1024; // 5MB
   const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

   const validationSchema = Yup.object({
      name: Yup.string()
         .matches(/^[A-Za-z\s]+$/, "Only alphabets are allowed")
         .required("Name is required"),
      address: Yup.string()
         .matches(/^[A-Za-z0-9\s]+$/, "Enter the address correctly")
         .required("Address is required"),
      pincode: Yup.string()
         .matches(/^\d{6}$/, "Pincode must be exactly 6 digits")
         .required("Pincode is required"),
      taluk: Yup.string().required("Taluk is required"),
      wardNo: Yup.string().required("Ward No./Street Name is required"),
      department: Yup.string().required("Department is required"),
      district: Yup.string().required("District is required"),
      comment: Yup.string().required("Description is required"),
      images: Yup.array().of(
         Yup.mixed()
            .test(
               "fileSize", 
               "File is too large, maximum size is 5MB",
               value => !value || (value && value.size <= FILE_SIZE)
            )
            .test(
               "fileFormat",
               "Unsupported format. Only JPG, JPEG, and PNG are allowed",
               value => !value || (value && SUPPORTED_FORMATS.includes(value.type))
            )
      )
   });

   const handleImageChange = (event) => {
      const files = Array.from(event.currentTarget.files);

      if (files.length === 0) {
         setImagePreview([]);
         setImageFile([]);
         formik.setFieldValue("images", []);
         return;
      }

      if (files.length > 5) {
         toast.error("You can only upload up to 5 images", toastConfig);
         return;
      }

      const validFiles = files.filter(file => {
         if (file.size > FILE_SIZE) {
            toast.error(`File ${file.name} is too large. Maximum size is 5MB`, toastConfig);
            return false;
         }

         if (!SUPPORTED_FORMATS.includes(file.type)) {
            toast.error(`File ${file.name} has unsupported format. Only JPG, JPEG and PNG are allowed`, toastConfig);
            return false;
         }

         return true;
      });

      if (validFiles.length === 0) {
         return;
      }

      formik.setFieldValue("images", validFiles);
      setImageFile(validFiles);

      const previews = validFiles.map((file) => {
         const reader = new FileReader();
         reader.readAsDataURL(file);
         return new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
         });
      });

      Promise.all(previews).then((results) => setImagePreview(results));
   };

   const toastConfig = {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored"
   };

   const formik = useFormik({
      initialValues: {
         userId: user._id,
         name: '',
         address: '',
         pincode: '',
         taluk: '',
         wardNo: '',
         department: '',
         district: 'Tumkur', // Default value
         comment: '',
         status: 'pending',
         images: []
      },
      validationSchema,
      onSubmit: async (values, { resetForm }) => {
         try {
            const formData = new FormData();
            Object.keys(values).forEach((key) => {
               if (key === 'images') {
                  values.images.forEach((image) => formData.append('images', image));
               } else {
                  formData.append(key, values[key]);
               }
            });

            await axios.post(
               `http://localhost:8000/Complaint/${user._id}`, 
               formData, 
               {
                  headers: {
                     'Content-Type': 'multipart/form-data'
                  }
               }
            );
            toast.success("🎉 Complaint submitted successfully!", toastConfig);
            resetForm();
         } catch (err) {
            toast.error("❌ Failed to submit complaint. Please try again.", toastConfig);
            console.error(err);
         }
      },
   });

   return (
      <div className="complaint-container">
         <div className="complaint-card">
            <div className="complaint-header">
               <h2>Register a Complaint</h2>
               <p>Fill out the form below to register your complaint</p>
            </div>
            
            <form onSubmit={formik.handleSubmit} className="complaint-form" encType="multipart/form-data">
               <div className="form-row">
                  <div className="form-group">
                     <label htmlFor="name">Full Name</label>
                     <input
                        name="name"
                        type="text"
                        className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                        placeholder="Enter your name"
                        {...formik.getFieldProps("name")}
                     />
                     {formik.touched.name && formik.errors.name ? <div className="error-message">{formik.errors.name}</div> : null}
                  </div>

                  <div className="form-group">
                     <label htmlFor="address">Address</label>
                     <input
                        name="address"
                        type="text"
                        className={`form-control ${formik.touched.address && formik.errors.address ? 'is-invalid' : ''}`}
                        placeholder="Enter your address"
                        {...formik.getFieldProps("address")}
                     />
                     {formik.touched.address && formik.errors.address ? <div className="error-message">{formik.errors.address}</div> : null}
                  </div>
               </div>

               <div className="form-row">
                  <div className="form-group">
                     <label htmlFor="wardNo">Ward No./Street Name</label>
                     <input
                        name="wardNo"
                        type="text"
                        className={`form-control ${formik.touched.wardNo && formik.errors.wardNo ? 'is-invalid' : ''}`}
                        placeholder="Enter ward number/street name"
                        {...formik.getFieldProps("wardNo")}
                     />
                     {formik.touched.wardNo && formik.errors.wardNo ? <div className="error-message">{formik.errors.wardNo}</div> : null}
                  </div>

                  <div className="form-group">
                     <label htmlFor="pincode">Pincode</label>
                     <input
                        name="pincode"
                        type="text"
                        className={`form-control ${formik.touched.pincode && formik.errors.pincode ? 'is-invalid' : ''}`}
                        placeholder="Enter your pincode"
                        {...formik.getFieldProps("pincode")}
                     />
                     {formik.touched.pincode && formik.errors.pincode ? <div className="error-message">{formik.errors.pincode}</div> : null}
                  </div>
               </div>

               <div className="form-row">
               <div className="form-group">
                     <label htmlFor="district">District</label>
                     <select 
                        name="district" 
                        className={`form-control ${formik.touched.district && formik.errors.district ? 'is-invalid' : ''}`} 
                        {...formik.getFieldProps("district")}
                        disabled // Disable the dropdown
                     >
                        <option value="Tumkur">Tumkur</option>
                     </select>
                     {formik.touched.district && formik.errors.district ? (
                        <div className="error-message">{formik.errors.district}</div>
                     ) : null}
                  </div>
                  <div className="form-group">
                     <label htmlFor="taluk">Taluk</label>
                     <select 
                        name="taluk" 
                        className={`form-control ${formik.touched.taluk && formik.errors.taluk ? 'is-invalid' : ''}`} 
                        {...formik.getFieldProps("taluk")}
                     >
                        <option value="">Select Taluk</option>
                        <option value="Tumakuru">Tumakuru</option>
                        <option value="Tiptur">Tiptur</option>
                        <option value="Turuvekere">Turuvekere</option>
                        <option value="Kunigal">Kunigal</option>
                        <option value="Gubbi">Gubbi</option>
                        <option value="Koratagere">Koratagere</option>
                        <option value="Madhugiri">Madhugiri</option>
                        <option value="Sira">Sira</option>
                        <option value="Pavagada">Pavagada</option>
                        <option value="Chikkanayakanahalli">Chikkanayakanahalli</option>
                     </select>
                     {formik.touched.taluk && formik.errors.taluk ? <div className="error-message">{formik.errors.taluk}</div> : null}
                  </div>
               </div>

               <div className="form-row">
                  <div className="form-group">
                     <label htmlFor="department">Department</label>
                     <select 
                        name="department" 
                        className={`form-control ${formik.touched.department && formik.errors.department ? 'is-invalid' : ''}`} 
                        {...formik.getFieldProps("department")}
                     >
                        <option value="">Select Department</option>
                        <option value="Education">Education</option>
                        <option value="Health">Health</option>
                        <option value="Municipal">Municipal</option>
                        <option value="Others">Others</option>
                     </select>
                     {formik.touched.department && formik.errors.department ? <div className="error-message">{formik.errors.department}</div> : null}
                  </div>
               </div>

               <div className="form-row">
                 
               </div>

               <div className="form-group full-width">
                  <label htmlFor="comment">Description</label>
                  <textarea
                     name="comment"
                     className={`form-control ${formik.touched.comment && formik.errors.comment ? 'is-invalid' : ''}`}
                     placeholder="Enter a description of your complaint"
                     rows="4"
                     {...formik.getFieldProps("comment")}
                  ></textarea>
                  {formik.touched.comment && formik.errors.comment ? <div className="error-message">{formik.errors.comment}</div> : null}
               </div>
               
               {/* Image Upload Section */}
               <div className="form-group full-width">
                  <label htmlFor="images">Upload Images (Optional)</label>
                  <input
                     id="images"
                     name="images"
                     type="file"
                     accept="image/jpeg, image/png, image/jpg"
                     className={`form-control ${formik.touched.images && formik.errors.images ? 'is-invalid' : ''}`}
                     onChange={handleImageChange}
                     multiple
                  />
                  {formik.touched.images && formik.errors.images ? (
                     <div className="error-message">{formik.errors.images}</div>
                  ) : null}
                  
                  {/* Image Previews */}
                  {imagePreview.length > 0 && (
                     <div className="image-preview-section">
                        <div className="image-thumbnails">
                           {imagePreview.map((preview, index) => (
                              <div key={index} className="image-container">
                                 <img 
                                    src={preview} 
                                    alt={`Preview ${index + 1}`} 
                                    className="complaint-thumbnail"
                                    style={{ width: '300px', height: '200px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' }} // Adjusted size
                                 />
                                 <button 
                                    type="button" 
                                    className="remove-image-btn"
                                    onClick={() => {
                                       const updatedPreviews = imagePreview.filter((_, i) => i !== index);
                                       const updatedFiles = imageFile.filter((_, i) => i !== index);
                                       setImagePreview(updatedPreviews);
                                       setImageFile(updatedFiles);
                                       formik.setFieldValue("images", updatedFiles);
                                    }}
                                 >
                                    <i className="fa-solid fa-times"></i>
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>

               <div className="form-action">
                  <button 
                     type="submit" 
                     className="submit-button" 
                     disabled={formik.isSubmitting} // Corrected usage
                  >
                     Register Complaint
                  </button>
               </div>
            </form>
         </div>
         
         <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
         />
      </div>
   );
};

export default Complaint;