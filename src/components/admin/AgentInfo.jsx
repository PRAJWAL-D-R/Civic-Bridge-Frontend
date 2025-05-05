import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import { Accordion, Card, Container } from 'react-bootstrap'; // Removed Modal and Button
import Footer from '../common/FooterC';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AgentInfo = () => {
   const navigate = useNavigate();
   const [ordinaryList, setOrdinaryList] = useState([]);

   // Styles object
   const styles = {
      container: {
         padding: '2rem 1rem',
         maxWidth: '1200px',
         margin: '0 auto',
      },
      accordion: {
         borderRadius: '15px',
         overflow: 'hidden',
         boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      },
      accordionHeader: {
         background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
         border: 'none',
      },
      accordionBody: {
         background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f0ff 100%)',
         padding: '1.5rem',
      },
      cardsContainer: {
         display: 'grid',
         gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
         gap: '1.5rem',
         padding: '1rem 0',
      },
      card: {
         border: 'none',
         borderRadius: '12px',
         boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
         transition: 'all 0.3s ease',
         background: 'white',
         overflow: 'hidden',
      },
      cardBody: {
         padding: '1.5rem',
      },
      cardTitle: {
         fontSize: '1.1rem',
         fontWeight: '600',
         color: '#2c3e50',
         marginBottom: '1rem',
         borderBottom: '2px solid #f0f2f5',
         paddingBottom: '0.8rem',
         display: 'flex',
         alignItems: 'center',
         gap: '0.5rem',
      },
      cardText: {
         display: 'flex',
         alignItems: 'center',
         gap: '0.5rem',
         fontSize: '0.95rem',
         color: '#495057',
         marginBottom: '0.8rem',
      },
      alert: {
         borderRadius: '12px',
         padding: '1.5rem',
         background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
         border: 'none',
         color: '#1976d2',
         boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
      },
   };

   useEffect(() => {
      const getOrdinaryRecords = async () => {
         try {
            const response = await axios.get('https://civic-bridge-backend-1.onrender.com/agentUsers');
            const ordinary = response.data;
            setOrdinaryList(ordinary);
            toast.success('✅ Agents fetched successfully'); // Success toast for fetching agents
         } catch (error) {
            console.log(error);
            toast.error('❌ Failed to fetch agents'); // Error toast for fetching agents
         }
      };
      getOrdinaryRecords();
   }, [navigate]);

   return (
      <>
         <Container style={styles.container}>
            <Accordion style={styles.accordion}>
               <Accordion.Item eventKey="0">
                  <Accordion.Header style={styles.accordionHeader}>
                     Agent Information
                  </Accordion.Header>
                  <Accordion.Body style={styles.accordionBody}>
                     <div style={styles.cardsContainer}>
                        {ordinaryList.length > 0 ? (
                           ordinaryList.map((agent) => (
                              <Card key={agent._id} style={styles.card}>
                                 <Card.Body style={styles.cardBody}>
                                    <Card.Title style={styles.cardTitle}>
                                       <span>👤</span> {agent.name}
                                    </Card.Title>
                                    <div style={styles.cardText}>
                                       <span>📧</span> {agent.email}
                                    </div>
                                    <div style={styles.cardText}>
                                       <span>📞</span> {agent.phone}
                                    </div>
                                 </Card.Body>
                              </Card>
                           ))
                        ) : (
                           <Alert style={styles.alert}>
                              <Alert.Heading>No Agents to show</Alert.Heading>
                           </Alert>
                        )}
                     </div>
                  </Accordion.Body>
               </Accordion.Item>
            </Accordion>
         </Container>

         <Footer />
      </>
   );
};

export default AgentInfo;