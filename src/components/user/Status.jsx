import axios from "axios";
import React, { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";
import { Button } from "react-bootstrap";
import ChatWindow from "../common/ChatWindow";
import Collapse from "react-bootstrap/Collapse";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

const Status = () => {
  const [toggle, setToggle] = useState({});
  const [statusCompliants, setStatusCompliants] = useState([]);
  const [escalationReason, setEscalationReason] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);

  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 60000); // every minute
    return () => clearInterval(interval);
  }, []);

  const fetchComplaints = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const { _id } = user;

    axios
      .get(`https://civic-bridge-backend-1.onrender.com/status/${_id}`)
      .then((res) => {
        const uniqueComplaints = res.data.filter(
          (complaint, index, self) =>
            index === self.findIndex((c) => c._id === complaint._id)
        );

        const processedComplaints = uniqueComplaints.map(complaint => {
          const createdAt = new Date(complaint.createdAt);
          const now = new Date();

          const diffInMinutes = (now - createdAt) / (1000 * 60); // Time in minutes
          // const diffInHours = (now - createdAt) / (1000 * 60 * 60); // Time in hours (24 hours)

          return {
            ...complaint,
            canEscalate: diffInMinutes >= 2 && complaint.status !== 'completed' && !complaint.escalated
            // canEscalate: diffInHours >= 24 && complaint.status !== 'completed' && !complaint.escalated
          };
        });

        console.log('Processed complaints:', processedComplaints);
        setStatusCompliants(processedComplaints);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleToggle = (complaintId) => {
    setToggle((prevState) => ({
      ...prevState,
      [complaintId]: !prevState[complaintId],
    }));
  };

  const handleEscalate = async (complaintId) => {
    try {
      await axios.post(`https://civic-bridge-backend-1.onrender.com/complaint/${complaintId}/escalate`, {
        reason: escalationReason,
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

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", margin: "20px" }}>
        {statusCompliants.length > 0 ? (
          statusCompliants.map((complaint, index) => {
            const open = toggle[complaint._id] || false;
            return (
              <Card
                key={index}
                style={{ width: "18.5rem", margin: "0 15px 15px 0" }}
              >
                <Card.Body>
                  <Card.Title>Name: {complaint.name}</Card.Title>
                  <Card.Text>Address: {complaint.address}</Card.Text>
                  <Card.Text>Pincode: {complaint.pincode}</Card.Text>
                  <Card.Text>Comment: {complaint.comment}</Card.Text>
                  <Card.Text>Ward No: {complaint.wardNo}</Card.Text>
                  <Card.Text>Taluk: {complaint.taluk}</Card.Text>
                  <Card.Text style={{ fontWeight: 'bold', color: '#0d6efd' }}>
                    Department: {complaint.department ? complaint.department : 'Not Assigned'}
                  </Card.Text>
                  <Card.Text style={{ 
                    fontWeight: 'bold', 
                    color: complaint.status === 'completed' ? '#198754' : '#dc3545'
                  }}>
                    Status: {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                  </Card.Text>
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
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    {!complaint.escalated && (
                      <Button
                        variant={complaint.canEscalate ? "warning" : "secondary"}
                        disabled={!complaint.canEscalate}
                        onClick={() => {
                          if (complaint.canEscalate) {
                            setSelectedComplaint(complaint);
                          } else {
                            toast.info('Escalation is not available yet (wait 2 minutes)');
                          }
                        }}
                      >
                        Escalate
                      </Button>
                    )}
                    <Button
                      style={{ marginLeft: "auto" }}
                      onClick={() => handleToggle(complaint._id)}
                      aria-controls={`collapse-${complaint._id}`}
                      aria-expanded={open}
                      variant="primary"
                    >
                      Message
                    </Button>
                  </div>
                  <div style={{ minHeight: "100%" }}>
                    <Collapse in={open} dimension="width">
                      <div id="example-collapse-text">
                        <Card
                          body
                          style={{ width: "260px", marginTop: "12px" }}
                        >
                          <ChatWindow
                            key={complaint.complaintId}
                            complaintId={complaint._id}
                            name={complaint.name}
                          />
                        </Card>
                      </div>
                    </Collapse>
                  </div>
                </Card.Body>
              </Card>
            );
          })
        ) : (
          <Alert variant="info">
            <Alert.Heading>No complaints to show</Alert.Heading>
          </Alert>
        )}
      </div>

      {imageModalOpen && (
        <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.7)", zIndex: 2000 }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Complaint Image{modalImages.length > 1 ? 's' : ''}</h5>
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

      {selectedComplaint && (
        <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Escalate Complaint</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setSelectedComplaint(null);
                    setEscalationReason('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="escalationReason" className="form-label">Reason for Escalation</label>
                    <textarea
                      className="form-control"
                      id="escalationReason"
                      value={escalationReason}
                      onChange={(e) => setEscalationReason(e.target.value)}
                      rows="3"
                      placeholder="Please provide a reason for escalation"
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setSelectedComplaint(null);
                    setEscalationReason('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => handleEscalate(selectedComplaint._id)}
                >
                  Confirm Escalation
                </button>
              </div>
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
    </>
  );
};

export default Status;
