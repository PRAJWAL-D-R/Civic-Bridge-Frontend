import React, { useState, useEffect } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Footer from '../common/FooterC';
import axios from 'axios';
import './AccordionAdmin.css'; // Import the CSS file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTimes, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const AccordionAdmin = () => {
  const [complaintList, setComplaintList] = useState([]);
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [agentList, setAgentList] = useState([]);
  const [selectedImages, setSelectedImages] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const getComplaints = async () => {
      try {
        const response = await axios.get('https://civic-bridge-backend-1.onrender.com/status');
        const complaints = response.data;
        console.log('Admin received complaints:', complaints);
        const unassignedComplaints = complaints.filter(complaint => !complaint.assigned);
        setComplaintList(unassignedComplaints);
      } catch (error) {
        console.log(error);
      }
    };

    const getAssignedComplaints = async () => {
      try {
        const response = await axios.get('https://civic-bridge-backend-1.onrender.com/assignedComplaints');
        const assigned = response.data;
        setAssignedComplaints(assigned);
      } catch (error) {
        console.log(error);
      }
    };

    const getAgentsRecords = async () => {
      try {
        const response = await axios.get('https://civic-bridge-backend-1.onrender.com/AgentUsers');
        const agents = response.data;
        setAgentList(agents);
      } catch (error) {
        console.log(error);
      }
    };

    getComplaints();
    getAssignedComplaints();
    getAgentsRecords();
  }, []);

  const handleSelection = async (agentId, complaintId, status, agentName) => {
    try {
      await axios.get(`https://civic-bridge-backend-1.onrender.com/AgentUsers/${agentId}`);
      const complaintToAssign = complaintList.find(complaint => complaint._id === complaintId);
      const assignedComplaint = {
        agentId,
        complaintId,
        status,
        agentName,
        complaintDetails: complaintToAssign
      };

      await axios.post('https://civic-bridge-backend-1.onrender.com/assignedComplaints', assignedComplaint);
      const updatedComplaint = { ...complaintToAssign, assigned: true, agentName };
      const updatedComplaintList = complaintList.filter((complaint) => complaint._id !== complaintId);
      setComplaintList(updatedComplaintList);
      setAssignedComplaints([...assignedComplaints, assignedComplaint]);
      alert(`Complaint assigned to the Agent ${agentName}`);
    } catch (error) {
      console.log(error);
    }
  };

  const handleViewImages = (images) => {
    setSelectedImages(images.map(image => `https://civic-bridge-backend-1.onrender.com${image}`));
    setCurrentImageIndex(0);
  };

  const handleCloseViewer = () => {
    setSelectedImages(null);
  };

  const handleNextImage = () => {
    if (!selectedImages) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === selectedImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePreviousImage = () => {
    if (!selectedImages) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? selectedImages.length - 1 : prevIndex - 1
    );
  };

  // Render the "View Image" button at the bottom of the card
  const renderViewImageButton = (images) => {
    if (!images || images.length === 0) return null;
    
    return (
      <Button 
        variant="outline-primary" 
        className="view-image-btn"
        onClick={() => handleViewImages(images)} 
        style={{ 
          width: '100%', 
          marginTop: '10px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <FontAwesomeIcon icon={faEye} style={{ marginRight: '5px' }} /> 
        View Images ({images.length})
      </Button>
    );
  };

  // Render the Image Viewer Modal
  const renderImageViewer = () => {
    if (!selectedImages || selectedImages.length === 0) return null;

    return (
      <div 
        className="image-viewer-overlay"
        onClick={handleCloseViewer}
        onKeyDown={(e) => {
          if (e.key === 'Escape') handleCloseViewer();
          if (e.key === 'ArrowRight') handleNextImage();
          if (e.key === 'ArrowLeft') handlePreviousImage();
        }}
        tabIndex="0"
      >
        <div className="image-viewer-container" onClick={(e) => e.stopPropagation()}>
          <button className="close-viewer-btn" onClick={handleCloseViewer}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          
          <img 
            src={selectedImages[currentImageIndex]} 
            alt={`Complaint image ${currentImageIndex + 1}`} 
            className="image-viewer-image"
          />
          
          {selectedImages.length > 1 && (
            <div className="image-navigation">
              <button className="nav-btn" onClick={handlePreviousImage}>
                <FontAwesomeIcon icon={faArrowLeft} /> Previous
              </button>
              <span style={{ color: 'white', padding: '5px 10px' }}>
                {currentImageIndex + 1} / {selectedImages.length}
              </span>
              <button className="nav-btn" onClick={handleNextImage}>
                Next <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Accordion className='accordion' alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>📝 Users Complaints</Accordion.Header>
          <Accordion.Body style={{ background: 'aliceblue' }}>
            <div style={{ display: "flex", flexWrap: "wrap", margin: "20px" }}>
              {complaintList.length > 0 ? (
                complaintList.map((complaint, index) => (
                  <Card key={index} className="card" style={{ width: '15rem', margin: '0 10px 15px 0' }}>
                    <Card.Body style={{ textAlign: 'center' }}>
                      <Card.Title>Name: {complaint.name}</Card.Title>
                      <div style={{ fontSize: '14px', marginTop: '20px' }}>
                        <Card.Text>Address: {complaint.address}</Card.Text>
                        <Card.Text>Taluk: {complaint.taluk}</Card.Text>
                        <Card.Text>Ward No: {complaint.wardNo}</Card.Text>
                        <Card.Text>Pincode: {complaint.pincode}</Card.Text>
                        <Card.Text style={{ fontWeight: 'bold', color: '#0d6efd' }}>
                          Department: {complaint.department ? complaint.department : 'Not Assigned'}
                        </Card.Text>
                        <Card.Text>Comment: {complaint.comment}</Card.Text>
                      </div>
                      <Dropdown className='mt-2'>
                        <Dropdown.Toggle variant="warning" id="dropdown-basic">
                          Assign 🤝
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {agentList.map((agent, index) => (
                            <Dropdown.Item key={index} onClick={() => handleSelection(agent._id, complaint._id, "pending", agent.name)}>
                              {agent.name} 👤
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                      {renderViewImageButton(complaint.images)}
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <Alert variant="info">
                  <Alert.Heading>No complaints to show</Alert.Heading>
                </Alert>
              )}
            </div>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>✅ Assigned Complaints</Accordion.Header>
          <Accordion.Body style={{ background: 'aliceblue' }}>
            <div style={{ display: "flex", flexWrap: "wrap", margin: "20px" }}>
              {assignedComplaints.length > 0 ? (
                assignedComplaints.map((assigned, index) => {
                  const complaintDetails = assigned.complaintDetails || {};
                  return (
                    <Card key={index} className="card" style={{ width: '15rem', margin: '0 10px 15px 0' }}>
                      <Card.Body style={{ textAlign: 'center' }}>
                        <Card.Title>Name: {complaintDetails.name}</Card.Title>
                        <div style={{ fontSize: '14px', marginTop: '20px' }}>
                          <Card.Text>Address: {complaintDetails.address}</Card.Text>
                          <Card.Text>Taluk: {complaintDetails.taluk}</Card.Text>
                          <Card.Text>Ward No: {complaintDetails.wardNo}</Card.Text>
                          <Card.Text>Pincode: {complaintDetails.pincode}</Card.Text>
                          <Card.Text style={{ fontWeight: 'bold', color: '#0d6efd' }}>
                            Department: {complaintDetails.department ? complaintDetails.department : 'Not Assigned'}
                          </Card.Text>
                          <Card.Text>Comment: {complaintDetails.comment}</Card.Text>
                          <Card.Text style={{ fontWeight: 'bold', color: 'green' }}>
                            Assigned To: {assigned.agentName} 👮
                          </Card.Text>
                          <Card.Text style={{ fontWeight: 'bold', color: 'orange' }}>
                            Status: {assigned.status} 📊
                          </Card.Text>
                        </div>
                        {renderViewImageButton(complaintDetails.images)}
                      </Card.Body>
                    </Card>
                  );
                })
              ) : (
                <Alert variant="info">
                  <Alert.Heading>No assigned complaints to show</Alert.Heading>
                </Alert>
              )}
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      
      {/* Image Viewer Modal */}
      {renderImageViewer()}
      
      <Footer />
    </div>
  );
};

export default AccordionAdmin;