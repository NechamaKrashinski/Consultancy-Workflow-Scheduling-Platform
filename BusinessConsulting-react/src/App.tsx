import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { initializeAuth } from './store/slices/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import BookingPage from './pages/client/BookingPage';
import ClientDashboard from './pages/client/ClientDashboard';
// import ClientDashboard from './pages/client/ClientDashboard';


const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/manager/*" 
        element={
          <ProtectedRoute requiredRole="manager">
            <ManagerDashboard />
          </ProtectedRoute>
        } 
      />
       <Route 
        path="/client/*" 
        element={
          <ProtectedRoute requiredRole="client">
            <ClientDashboard />
            {/* <BookingPage /> */}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          user ? (
            <Navigate to={user.role === 'manager' ? '/manager' : '/client'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route path="*" element={<Navigate to="/\" replace />} />
    </Routes>
  ); 
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;