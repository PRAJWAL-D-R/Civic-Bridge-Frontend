import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ImageViewer from '../common/ImageViewer';
import './ComplaintList.css';

const ComplaintList = () => {
   const [complaints, setComplaints] = useState([]);
   const [loading, setLoading] = useState(true);
   const [selectedImages, setSelectedImages] = useState(null);

   useEffect(() => {
      fetchComplaints();
   }, []);

   const fetchComplaints = async () => {
      try {
         const response = await axios.get('https://civic-bridge-backend-1.onrender.com/status');
         setComplaints(response.data);
         setLoading(false);
      } catch (error) {
         console.error('Error fetching complaints:', error);
         toast.error('Failed to fetch complaints');
         setLoading(false);
      }
   };

   const handleViewImages = (images) => {
      setSelectedImages(images.map(image => `https://civic-bridge-backend-1.onrender.com${image}`));
   };

   const handleCloseViewer = () => {
      setSelectedImages(null);
   };

   const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
         case 'pending':
            return 'status-pending';
         case 'in progress':
            return 'status-progress';
         case 'completed':
            return 'status-completed';
         case 'escalated':
            return 'status-escalated';
         default:
            return '';
      }
   };

   return (
      <div className="complaint-list-container">
         <div className="complaint-list-header">
            <h2>All Complaints</h2>
         </div>

         {loading ? (
            <div className="loading-spinner">Loading...</div>
         ) : (
            <div className="complaints-grid">
               {complaints.map((complaint) => (
                  <div key={complaint._id} className="complaint-card">
                     <div className="complaint-header">
                        <h3>{complaint.name}</h3>
                        <span className={`status-badge ${getStatusColor(complaint.status)}`}>
                           {complaint.status}
                        </span>
                     </div>
                     <div className="complaint-details">
                        <p><strong>Department:</strong> {complaint.department}</p>
                        <p><strong>Address:</strong> {complaint.address}</p>
                        <p><strong>Comment:</strong> {complaint.comment}</p>
                        <p><strong>Submitted:</strong> {new Date(complaint.createdAt).toLocaleString()}</p>
                        {complaint.images && complaint.images.length > 0 && (
                           <div className="complaint-images">
                              <div className="image-thumbnails">
                                 {complaint.images.map((image, index) => (
                                    <div key={index} className="image-container">
                                       <img 
                                          src={`https://civic-bridge-backend-1.onrender.com${image}`}
                                          alt={`Complaint ${index + 1}`}
                                          className="complaint-thumbnail"
                                          onClick={() => handleViewImages(complaint.images)}
                                       />
                                    </div>
                                 ))}
                              </div>
                              <button 
                                 className="view-images-button"
                                 onClick={() => handleViewImages(complaint.images)}
                              >
                                 <i className="fa-solid fa-expand"></i> View Full Images
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         )}

         {selectedImages && (
            <ImageViewer 
               images={selectedImages} 
               onClose={handleCloseViewer} 
            />
         )}

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

export default ComplaintList; 