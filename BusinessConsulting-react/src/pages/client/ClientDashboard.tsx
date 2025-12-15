import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import { fetchServices } from '../../store/slices/servicesSlice';
import { fetchClientMeetings } from '../../store/slices/meetingsSlice';
import { useToast } from '../../components/ToastProvider';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import DashboardHeader from './components/DashboardHeader';
import DashboardTabs from './components/DashboardTabs';
import BookingWizard from './components/BookingWizard';
import ClientMeetingsTab from './components/ClientMeetingsTab';
import ProfileUploadPage from './ProfileUploadPage';
import ProfileViewPage from '../ProfileViewPage';

const ClientDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'book-meeting' | 'my-meetings' | 'upload-files' | 'view-profile'>('book-meeting');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { showSuccess } = useToast();

  // טעינת נתונים ראשונית
  useEffect(() => {
    dispatch(fetchServices());
    if (activeTab === 'my-meetings') {
      dispatch(fetchClientMeetings());
    }
  }, [dispatch, activeTab]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
      showSuccess('התנתקות בוצעה', 'התנתקת בהצלחה מהמערכת');
    } catch {
      dispatch(logout());
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      
      <DashboardHeader user={user} onLogout={() => setShowLogoutDialog(true)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content Rendering */}
        <div className="mt-8">
          {activeTab === 'book-meeting' && <BookingWizard user={user} />}
          
          {activeTab === 'my-meetings' && <ClientMeetingsTab />}
          
          {activeTab === 'upload-files' && <ProfileUploadPage />}
          
          {activeTab === 'view-profile' && <ProfileViewPage />}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title="התנתקות מהמערכת"
        message="האם אתה בטוח שברצונך להתנתק מהמערכת?"
        confirmText="התנתק"
        cancelText="ביטול"
        type="warning"
        isLoading={isLoggingOut}
      />
    </div>
  );
};

export default ClientDashboard;