import { createContext, useEffect, useReducer, useState } from "react";
import SessionService from "../services/sessionService";
import Swal from "sweetalert2";

const INITIAL_STATE = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  loading: false,
  error: null,
};

export const AuthContext = createContext(INITIAL_STATE);

const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        user: null,
        loading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload,
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        user: null,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        user: null,
        loading: false,
        error: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);
  const [sessionWarning, setSessionWarning] = useState(false);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
  }, [state.user]);

  // Initialize session monitoring when user logs in
  useEffect(() => {
    if (state.user && localStorage.getItem("token")) {
      SessionService.initializeSession(
        handleSessionExpired,
        handleSessionWarning
      );
    } else {
      SessionService.stopSessionMonitoring();
      setSessionWarning(false);
    }

    return () => {
      if (!state.user) {
        SessionService.stopSessionMonitoring();
      }
    };
  }, [state.user]);

  const handleSessionExpired = () => {
    setSessionWarning(false);
    
    Swal.fire({
      title: "Session Expired",
      text: "Your session has expired after 1 hour. Please log in again.",
      icon: "warning",
      confirmButtonColor: "#1976d2",
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(() => {
      logout();
      window.location.href = "/login";
    });
  };

  const handleSessionWarning = () => {
    setSessionWarning(true);
    
    Swal.fire({
      title: "Session Expiring Soon",
      text: "Your session will expire in 5 minutes. Do you want to continue?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Continue Session",
      cancelButtonText: "Logout Now",
      confirmButtonColor: "#1976d2",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        // Reset session timer to give user another hour
        SessionService.resetSessionTimer();
        setSessionWarning(false);
      } else {
        logout();
        window.location.href = "/login";
      }
    });
  };

  const logout = () => {
    SessionService.stopSessionMonitoring();
    dispatch({ type: "LOGOUT" });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("adminLoginTime");
    localStorage.removeItem("sessionStartTime");
    setSessionWarning(false);
  };

  const updateUser = (userData) => {
    dispatch({ type: "UPDATE_USER", payload: userData });
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        sessionWarning,
        dispatch,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
