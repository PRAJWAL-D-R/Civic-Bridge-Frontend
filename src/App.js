import "./App.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./components/user/HomePage";
import Login from "./components/common/Login";
import AdminLogin from "./components/common/AdminLogin"; // Import AdminLogin
import SignUp from "./components/common/SignUp";
import Complaint from "./components/user/Complaint";
import Status from "./components/user/Status";
import AdminHome from "./components/admin/AdminHome";
import AgentHome from "./components/agent/AgentHome";
import UserInfo from "./components/admin/UserInfo";
import Home from "./components/common/Home";
import AgentInfo from "./components/admin/AgentInfo";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-loading-skeleton/dist/skeleton.css";

function App() {
  const isLoggedIn = !!localStorage.getItem("user");
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/AdminLogin" element={<AdminLogin />} /> {/* Add AdminLogin route */}
          <Route path="/SignUp" element={<SignUp />} />
          {isLoggedIn ? (
            <>
              <Route path="/AgentInfo" element={<AgentInfo />} />
              <Route path="/AgentHome" element={<AgentHome />} />
              <Route path="/UserInfo" element={<UserInfo />} />
              <Route path="/AdminHome" element={<AdminHome />} />
              <Route path="/HomePage" element={<HomePage />} />
              <Route path="/Complaint" element={<Complaint />} />
              <Route path="/Status" element={<Status />} />
            </>
          ) : (
            <Route path="/Login" element={<Login />} />
          )}
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;