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

import UserProfile from "./pages/UserProfile.jsx";
import VehicleManager from "./pages/VehicleManager.jsx";
import StationDetails from "./pages/StationDetails.jsx";
import Notifications from "./pages/Notifications.jsx";
import Settings from "./pages/Settings.jsx";
import HelpSupport from "./pages/HelpSupport.jsx";
import SubscriptionPlans from "./pages/SubscriptionPlans.jsx";
import ChargingHistory from "./pages/ChargingHistory.jsx";
import Footer from "./components/Footer.jsx";

import Register from "./pages/Register.jsx";
import Forget from "./pages/Forget.jsx";
import LoaderProvider from "./components/LoaderProvider.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";



// Layout wrapper that hides navbar on certain pages
function AppLayout() {
  const location = useLocation();

  // Pages where navbar should be hidden
  const hideNavbarPages = ["/login","/register","/forget"];
  const shouldHideNavbar = hideNavbarPages.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
<LoaderProvider>
      <Routes>
         <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
       
        <Route path="/register" element={<Register/>} />
        <Route path="/forget" element={<Forget/>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/trip" element={<TripPlanner />} />
        <Route path="/stations" element={<ProtectedRoute><StationFinder /></ProtectedRoute>} />
        <Route path="/bookings" element={ <ProtectedRoute><BookingsPage /></ProtectedRoute>} />
        <Route path="/payments" element={<PaymentPage />} />
        <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={  <ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/vehicles" element={ <ProtectedRoute><VehicleManager /></ProtectedRoute>} />
        <Route path="/history" element={  <ProtectedRoute><ChargingHistory /></ProtectedRoute>} />
        <Route path="/plans" element={<SubscriptionPlans />} />
<Route path="/station/:id" element={<StationDetails />} />
<Route path="/notifications" element={<Notifications />} />
<Route path="/settings" element={<Settings />} />
<Route path="/help" element={<HelpSupport />} />
      </Routes>
      </LoaderProvider>
      
      {!shouldHideNavbar && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
   
      
    </Router>
  );
}
