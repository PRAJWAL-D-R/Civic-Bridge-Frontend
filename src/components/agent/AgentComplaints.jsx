import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ImageViewer from '../common/ImageViewer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import './AgentComplaints.css';
import { Card } from 'react-bootstrap';

const AgentComplaints = () => {
   const [complaints, setComplaints] = useState([]);
   const [loading, setLoading] = useState(true);
   const [selectedImages, setSelectedImages] = useState(null);
   const user = JSON.parse(localStorage.getItem('user'));

   useEffect(() => {
      fetchComplaints();
   }, []);

   const fetchComplaints = async () => {
      try {
         const response = await axios.get(`https://civic-bridge-backend-1.onrender.com/allcomplaints/${user._id}`);
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

   const renderImageIcons = (images) => {
      return (
         <div className="complaint-images">
            <div className="image-icons">
               {images.map((_, imgIndex) => (
                  <button
                     key={imgIndex}
                     className="image-eye-button"
                     onClick={() => handleViewImages(images)}
                     title={`View Image ${imgIndex + 1}`}
                  >
                     <FontAwesomeIcon icon={faEye} />
                  </button>
               ))}
            </div>
         </div>
      );
   };

   const handleStatusUpdate = async (complaintId, newStatus) => {
      try {
         await axios.put(`https://civic-bridge-backend-1.onrender.com/${complaintId}`, {
            status: newStatus
         });
         toast.success('Status updated successfully');
         fetchComplaints();
      } catch (error) {
         console.error('Error updating status:', error);
         toast.error('Failed to update status');
      }
   };

   const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
         case 'pending':
            return 'pending';
         case 'in progress':
            return 'in-progress';
         case 'completed':
            return 'completed';
         default:
            return '';
      }
   };

   const renderComplaintCards = () => {
      return complaints.map((complaint) => (
         <Card key={complaint._id} style={{ width: '15rem', margin: '10px' }}>
            <Card.Body className="text-center">
               <div className="card-header-row">
                  <Card.Title className="card-title mb-0">
                     {complaint.name}
                  </Card.Title>
                  {complaint.images && complaint.images.length > 0 && (
                     <div className="complaint-images">
                        {renderImageIcons(complaint.images)}
                     </div>
                  )}
               </div>
               <Card.Text>
                  <strong>Department:</strong> {complaint.department}<br />
                  <strong>Address:</strong> {complaint.address}<br />
                  <strong>Taluk:</strong> {complaint.taluk}<br />
                  <strong>Ward Number:</strong> {complaint.wardNo}<br />
                  <strong>Pincode:</strong> {complaint.pincode}<br />
                  <span className={`status-badge ${getStatusColor(complaint.status)}`}>
                     Status: {complaint.status}
                  </span>
               </Card.Text>
            </Card.Body>
         </Card>
      ));
   };

   return (
      <div className="agent-complaints-container">
         <div className="agent-complaints-header">
            <h2>Your Assigned Complaints</h2>
         </div>

         {loading ? (
            <div className="loading-spinner">Loading...</div>
         ) : (
            <div className="complaints-grid">
               {renderComplaintCards()}
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

export default AgentComplaints; 