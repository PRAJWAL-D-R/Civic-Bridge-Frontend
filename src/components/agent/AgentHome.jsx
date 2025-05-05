import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Card from 'react-bootstrap/Card';
import { useNavigate } from 'react-router-dom'; // Removed NavLink
import axios from 'axios';
import Alert from 'react-bootstrap/Alert';
import Collapse from 'react-bootstrap/Collapse';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import ChatWindow from '../common/ChatWindow';
import Footer from '../common/FooterC';
import '../agent/agenthome.css'; // custom styles if any
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

const AgentHome = () => {
   const style = { marginTop: '66px' };
   const navigate = useNavigate();
   const [userName, setUserName] = useState('');
   const [toggle, setToggle] = useState({});
   const [agentComplaintList, setAgentComplaintList] = useState([]);
   const [activeTab, setActiveTab] = useState('pending');
   const [showToast, setShowToast] = useState(false);
   const [toastMessage, setToastMessage] = useState('');
   const [toastVariant, setToastVariant] = useState('success');
   const [imageModalOpen, setImageModalOpen] = useState(false);
   const [modalImages, setModalImages] = useState([]);

   useEffect(() => {
      const getData = async () => {
         try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
               const { _id, name } = user;
               setUserName(name);
               
               // Fetch both assigned complaints and their details
               const [assignedResponse, complaintsResponse] = await Promise.all([
                  axios.get(`https://civic-bridge-backend-1.onrender.com/assignedComplaints`),
                  axios.get(`https://civic-bridge-backend-1.onrender.com/status`)
               ]);

               // Filter complaints assigned to this agent
               const agentAssignedComplaints = assignedResponse.data.filter(
                  assigned => assigned.agentId === _id
               );

               // Map assigned complaints with their details
               const detailedComplaints = agentAssignedComplaints.map(assigned => {
                  const complaintDetails = complaintsResponse.data.find(
                     complaint => complaint._id === assigned.complaintId
                  );
                  return {
                     ...complaintDetails,
                     status: assigned.status,
                     complaintId: assigned.complaintId
                  };
               });

               setAgentComplaintList(detailedComplaints);
            } else {
               navigate('/');
            }
         } catch (error) {
            console.error('Error fetching complaints:', error);
            showToastMessage('Failed to fetch complaints. Please try again.', 'danger');
         }
      };
      getData();
   }, [navigate]);

   const showToastMessage = (message, variant = 'success') => {
      setToastMessage(message);
      setToastVariant(variant);
      setShowToast(true);
   };

   const handleStatusChange = async (complaintId) => {
      try {
         // Update the complaint status
         await axios.put(`https://civic-bridge-backend-1.onrender.com/complaint/${complaintId}`, { 
            status: 'completed',
            updateTime: new Date().toISOString()
         });

         // Update the local state to reflect changes immediately
         setAgentComplaintList((prevComplaints) =>
            prevComplaints.map((complaint) =>
               complaint.complaintId === complaintId
                  ? { 
                      ...complaint, 
                      status: 'completed',
                      updateTime: new Date().toISOString()
                    }
                  : complaint
            )
         );

         // Switch to the completed tab after marking as completed
         setActiveTab('completed');

         // Show success message with toast
         showToastMessage('Status updated successfully to completed');
      } catch (error) {
         console.log('Error updating status:', error);
         showToastMessage('Failed to update status. Please try again.', 'danger');
      }
   };

   const handleToggle = (complaintId) => {
      setToggle((prevState) => ({
         ...prevState,
         [complaintId]: !prevState[complaintId],
      }));
   };

   const LogOut = () => {
      localStorage.removeItem('user');
      navigate('/');
   };

   // Filter complaints based on status
   const pendingComplaints = agentComplaintList.filter(
      complaint => complaint.status !== 'completed'
   );
   
   const completedComplaints = agentComplaintList.filter(
      complaint => complaint.status === 'completed'
   );

   // Custom tab styles
   const tabStyle = {
      color: '#000',
      fontWeight: '500'
   };

   const renderComplaintCards = (complaints) => {
      if (complaints.length === 0) {
         return (
            <Alert variant="info">
               <Alert.Heading>No complaints to show</Alert.Heading>
            </Alert>
         );
      }

      return complaints.map((complaint, index) => {
         const open = toggle[complaint.complaintId] || false;
         return (
            <Card key={index} style={{ width: '18rem', margin: '15px' }}>
               <Card.Body>
                  <Card.Title><b>Name:</b> {complaint.name}</Card.Title>
                  <Card.Text><b>Address:</b> {complaint.address}</Card.Text>
                  <Card.Text><b>Pincode:</b> {complaint.pincode}</Card.Text>
                  <Card.Text><b>Taluk:</b> {complaint.taluk}</Card.Text>
                  <Card.Text><b>Ward No:</b> {complaint.wardNo}</Card.Text>
                  <Card.Text><b>Comment:</b> {complaint.comment}</Card.Text>
                  <Card.Text>
                     <b>Status:</b> <span style={{ 
                        color: complaint.status === 'completed' ? 'green' : 'orange',
                        fontWeight: 'bold'
                     }}>{complaint.status}</span>
                  </Card.Text>
                  <Card.Text><b>Department:</b> {complaint.department}</Card.Text>
                  {/* Eye icon for images */}
                  {complaint.images && complaint.images.length > 0 && (
                     <Button
                        variant="outline-primary"
                        size="sm"
                        style={{ marginBottom: '10px' }}
                        onClick={() => {
                           setModalImages(complaint.images);
                           setImageModalOpen(true);
                        }}
                     >
                        <FontAwesomeIcon icon={faEye} /> View Image{complaint.images.length > 1 ? 's' : ''}
                     </Button>
                  )}
                  {complaint.status !== 'completed' && (
                     <Button 
                        onClick={() => handleStatusChange(complaint.complaintId)} 
                        variant="primary"
                        className="me-2">
                        Mark as Completed
                     </Button>
                  )}
                  <Button 
                     onClick={() => handleToggle(complaint.complaintId)}
                     aria-controls={`collapse-${complaint.complaintId}`}
                     aria-expanded={open}
                     variant="outline-primary">
                     Message
                  </Button>
                  <div>
                     <Collapse in={open} dimension="width">
                        <div id="example-collapse-text">
                           <Card body style={{ width: '250px', marginTop: '12px' }}>
                              <ChatWindow 
                                 key={complaint.complaintId} 
                                 complaintId={complaint.complaintId} 
                                 name={userName} 
                              />
                           </Card>
                        </div>
                     </Collapse>
                  </div>
               </Card.Body>
            </Card>
         );
      });
   };

   return (
      <>
         <div className="body">
            <Navbar className="text-white" bg="dark" expand="lg">
               <Container fluid>
                  <Navbar.Brand className="text-white">
                     Hi Agent {userName}
                  </Navbar.Brand>
                  <Navbar.Toggle aria-controls="navbarScroll" />
                  <Navbar.Collapse id="navbarScroll">
                     <Nav className="text-white me-auto my-2 my-lg-0" style={{ maxHeight: '100px' }} navbarScroll>
                        {/* <NavLink style={{ textDecoration: 'none' }} className="text-white">
                           View Complaints
                        </NavLink> */}
                     </Nav>
                     <Button 
                        onClick={LogOut} 
                        variant="outline-danger" 
                        className="text-white" 
                        style={{ marginRight: '40px' }} // Add this style
                     >
                        Logout
                     </Button>
                  </Navbar.Collapse>
               </Container>
            </Navbar>

            <div className="container mt-4">
               <Tabs
                  id="complaint-tabs"
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="mb-3"
               >
                  <Tab 
                     eventKey="pending" 
                     title={
                        <span style={tabStyle}>
                           Pending Complaints ({pendingComplaints.length})
                        </span>
                     }
                  >
                     <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {renderComplaintCards(pendingComplaints)}
                     </div>
                  </Tab>
                  <Tab 
                     eventKey="completed" 
                     title={
                        <span style={tabStyle}>
                           Completed Complaints ({completedComplaints.length})
                        </span>
                     }
                  >
                     <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {renderComplaintCards(completedComplaints)}
                     </div>
                  </Tab>
               </Tabs>
            </div>

            {/* Toast Container for notifications */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1 }}>
               <Toast 
                  bg={toastVariant}
                  onClose={() => setShowToast(false)} 
                  show={showToast} 
                  delay={3000} 
                  autohide
               >
                  <Toast.Header>
                     <strong className="me-auto">Notification</strong>
                     <small>Just now</small>
                  </Toast.Header>
                  <Toast.Body className={toastVariant === 'dark' || toastVariant === 'danger' ? 'text-white' : ''}>
                     {toastMessage}
                  </Toast.Body>
               </Toast>
            </ToastContainer>
         </div>
         <Footer style={style} />
         {/* Image Modal */}
         {imageModalOpen && (
            <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.7)", zIndex: 2000 }}>
               <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                     <div className="modal-header">
                        <h5 className="modal-title">Complaint {modalImages.length > 1 ? 'Images' : 'Image'}</h5>
                        <button type="button" className="btn-close" onClick={() => setImageModalOpen(false)}></button>
                     </div>
                     <div className="modal-body text-center">
                        {modalImages.map((img, idx) => (
                           <img
                              key={idx}
                              src={img.startsWith('http') ? img : `https://civic-bridge-backend-1.onrender.com${img}`}
                              alt={`Complaint ${idx + 1}`} // Simplified alt text
                              style={{ maxWidth: '100%', maxHeight: '400px', margin: '10px 0' }}
                           />
                        ))}
                     </div>
                     <div className="modal-footer">
                        <Button variant="secondary" onClick={() => setImageModalOpen(false)}>
                           Close
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </>
   );
};

export default AgentHome;