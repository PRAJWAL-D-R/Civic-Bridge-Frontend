import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UserList.css';

const UserList = () => {
   const [users, setUsers] = useState([]);
   const [districts, setDistricts] = useState([]);
   const [selectedDistrict, setSelectedDistrict] = useState('');
   const [loading, setLoading] = useState(true);
   const [userType, setUserType] = useState('Ordinary'); // or 'Agent'

   useEffect(() => {
      fetchDistricts();
      fetchUsers();
   }, [selectedDistrict, userType]);

   const fetchDistricts = async () => {
      try {
         const response = await axios.get('https://civic-bridge-backend-1.onrender.com/districts');
         setDistricts(response.data);
      } catch (error) {
         console.error('Error fetching districts:', error);
         toast.error('Failed to fetch districts');
      }
   };

   const fetchUsers = async () => {
      try {
         setLoading(true);
         let url = `https://civic-bridge-backend-1.onrender.com/${userType}Users`;
         if (selectedDistrict) {
            url = `https://civic-bridge-backend-1.onrender.com/users/district/${selectedDistrict}`;
         }
         const response = await axios.get(url);
         setUsers(response.data);
         setLoading(false);
      } catch (error) {
         console.error('Error fetching users:', error);
         toast.error('Failed to fetch users');
         setLoading(false);
      }
   };

   const handleDelete = async (userId) => {
      if (window.confirm('Are you sure you want to delete this user?')) {
         try {
            await axios.delete(`https://civic-bridge-backend-1.onrender.com/${userType}Users/${userId}`);
            toast.success('User deleted successfully');
            fetchUsers();
         } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
         }
      }
   };

   return (
      <div className="user-list-container">
         <div className="user-list-header">
            <h2>{userType} Users</h2>
            <div className="filters">
               <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="user-type-select"
               >
                  <option value="Ordinary">Ordinary Users</option>
                  <option value="Agent">Agent Users</option>
               </select>
               <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="district-select"
               >
                  <option value="">All Districts</option>
                  {districts.map((district, index) => (
                     <option key={index} value={district}>{district}</option>
                  ))}
               </select>
            </div>
         </div>

         {loading ? (
            <div className="loading-spinner">Loading...</div>
         ) : (
            <div className="users-grid">
               {users.map((user) => (
                  <div key={user._id} className="user-card">
                     <div className="user-info">
                        <h3>{user.name}</h3>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Phone:</strong> {user.phone}</p>
                        <p><strong>District:</strong> {user.district}</p>
                     </div>
                     <div className="user-actions">
                        <button
                           className="delete-button"
                           onClick={() => handleDelete(user._id)}
                        >
                           Delete
                        </button>
                     </div>
                  </div>
               ))}
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

export default UserList; 