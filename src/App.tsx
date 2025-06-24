import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./lib/store";
import { injectSpeedInsights } from "@vercel/speed-insights";

// Layouts
import AuthLayout from "./components/Auth/AuthLayout";
import ProtectedLayout from "./components/ProtectedLayout";

// Auth Pages
import SignIn from "./components/Auth/SignIn";
import SignUp from "./components/Auth/SignUp";

// Protected Pages
// Protected Pages
import Dashboard from "./components/Dashboard";
import Creators from "./components/Creators";
import Employees from "./components/Employees";
import Tasks from "./components/Tasks";
import Library from "./components/Library";
import Marketing from "./components/Marketing";
import Costumes from "./components/Costumes";
import Financials from "./components/Financials";
import Credentials from "./components/Credentials";
import Settings from "./components/Settings";
import { useAppSelector } from "./redux/hooks"; // Adjust the path as needed
import VerifyEmail from "./components/Auth/VerifyEmail";
import socket from "./lib/socket";
import { useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { addNotifications } from "./redux/notifications/notifications";
import { setNewNotification } from "./redux/notifications/notifications";
import CheckoutPage from "./components/CheckoutPage";
import PaymentSuccessPage from "./components/PaymentSuccess";
import PaymentFailurePage from "./components/PaymentFailure";
//
import New from "./components/New";
import Receipts from "./components/ReceiptsAndInvoices";

function App() {
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const dispatch = useDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const { profile } = useAuthStore();

  injectSpeedInsights();

  const handleNotification = async (data: any) => {
    if (data.forId === currentUser.id) {
      const response = await axios.get(
        `${URL}/api/notifications/get-notifications/${data.forId}`
      );
      dispatch(addNotifications(response.data.notifications));
      dispatch(setNewNotification(true)); // to set it to true
      toast.success("New notification");
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    const userId = currentUser.id;

    function joinRoom() {
      if (!userId || userId === "false") return;
      socket.emit("join", userId);
    }

    socket.on("connect", joinRoom);
    socket.on("room-confirmation", ({ userId }) => {
      console.log("🛜 Confirmed room joined for:", userId);
    });
    joinRoom(); // Join immediately on mount (if already connected)

    socket.on("notification", (data: any) => {
      handleNotification(data);
    });

    return () => {
      socket.off("connect", joinRoom);
      socket.off("notification");
    };
  }, [currentUser]);
// 
// 
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedLayout />}>
          {/* Redirect creators from root to costumes */}
          <Route
            path="/"
            element={
              profile?.type === "creator" ? (
                <Navigate to="/costumes" replace />
              ) : (
                <Dashboard />
              )
            }
          />
          <Route path="/creators" element={<Creators />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/library" element={<Library />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/costumes" element={<Costumes />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="/credentials" element={<Credentials />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/payment-failure" element={<PaymentFailurePage />} />
          {/* //New ROutes */}
          <Route path="/documents" element={<New />} />
          <Route path="/receipts-and-invoices" element={<Receipts />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
