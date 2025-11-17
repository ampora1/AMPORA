import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TripPlanner from "./components/TripPlanner/TripPlanner.jsx";
import StationFinder from "./pages/StationFinder.jsx";
import BookingsPage from "./pages/BookingsPage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";

function Applaout(){
    const location = useLocation();
   const hideNavbar = location.pathname === "/login";


  return (
    <>
        <div>
          {!hideNavbar && <Navbar/>}
        </div>
        <div>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trip-planner" element={<TripPlanner />} />
          </Routes>
        </div>
      
    </>  
  );


}

function App() {
  return (
    <Router>

      <Applaout/>

      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trip" element={<TripPlanner />} />
        <Route path="/stations" element={<StationFinder />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/payments" element={<PaymentPage />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
      </Routes>

    </Router>
  );
}

export default App;
