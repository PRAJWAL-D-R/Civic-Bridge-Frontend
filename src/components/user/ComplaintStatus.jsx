import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ComplaintStatus.css';

const ComplaintStatus = () => {
   const [complaints, setComplaints] = useState([]);
   const [loading, setLoading] = useState(true);
   const [escalationReason, setEscalationReason] = useState('');
   const [selectedComplaint, setSelectedComplaint] = useState(null);
   const user = JSON.parse(localStorage.getItem('user'));

   useEffect(() => {
      fetchComplaints();
      // Set up interval to check escalation status
      const interval = setInterval(fetchComplaints, 60000); // Check every minute
      return () => clearInterval(interval);
   }, []);

   const fetchComplaints = async () => {
      try {
         const response = await axios.get(`https://civic-bridge-backend-1.onrender.com/status/${user._id}`);
         setComplaints(response.data);
         setLoading(false);
      } catch (error) {
         console.error('Error fetching complaints:', error);
         toast.error('Failed to fetch complaints');
         setLoading(false);
      }
   };

   const handleEscalate = async (complaintId) => {
      try {
         const response = await axios.post(`https://civic-bridge-backend-1.onrender.com/complaint/${complaintId}/escalate`, {
            reason: escalationReason
         });
         toast.success('Complaint escalated successfully');
         setEscalationReason('');
         setSelectedComplaint(null);
         fetchComplaints();
      } catch (error) {
         console.error('Error escalating complaint:', error);
         toast.error(error.response?.data?.error || 'Failed to escalate complaint');
      }
   };

   const checkEscalationStatus = async (complaintId) => {
      try {
         const response = await axios.put(`https://civic-bridge-backend-1.onrender.com/complaint/${complaintId}/update-escalation-status`);
         if (response.data.message === "Escalation enabled") {
            return true;
         }
         return false;
      } catch (error) {
         console.error('Error checking escalation status:', error);
         return false;
      }
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
      <div className="complaint-status-container">
         <div className="complaint-status-header">
            <h2>Your Complaints</h2>
         </div>

         {loading ? (
            <div className="loading-spinner">Loading...</div>
         ) : (
            <div className="complaints-list">
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
                              {complaint.images.map((image, index) => (
                                 <img 
                                    key={index} 
                                    src={`https://civic-bridge-backend-1.onrender.com${image}`} 
                                    alt={`Complaint ${index + 1}`} 
                                    className="complaint-image"
                                 />
                              ))}
                           </div>
                        )}
                     </div>
                     <div className="complaint-actions">
                        {!complaint.escalated && (
                           <button
                              className={`escalate-button ${complaint.canEscalate ? 'enabled' : 'disabled'}`}
                              onClick={() => {
                                 if (complaint.canEscalate) {
                                    setSelectedComplaint(complaint);
                                 } else {
                                    toast.info('Escalation will be available after 24 hours');
                                 }
                              }}
                              disabled={!complaint.canEscalate}
                           >
                              Escalate
                           </button>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         )}

         {selectedComplaint && (
            <div className="escalation-modal">
               <div className="modal-content">
                  <h3>Escalate Complaint</h3>
                  <textarea
                     value={escalationReason}
                     onChange={(e) => setEscalationReason(e.target.value)}
                     placeholder="Enter reason for escalation"
                     className="escalation-reason"
                  />
                  <div className="modal-actions">
                     <button 
                        onClick={() => handleEscalate(selectedComplaint._id)}
                        className="confirm-button"
                     >
                        Confirm Escalation
                     </button>
                     <button 
                        onClick={() => {
                           setSelectedComplaint(null);
                           setEscalationReason('');
                        }}
                        className="cancel-button"
                     >
                        Cancel
                     </button>
                  </div>
               </div>
            </div>
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

export default ComplaintStatus; 