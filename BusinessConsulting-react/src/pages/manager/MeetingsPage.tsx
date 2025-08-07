import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { updateMeeting } from '../../store/slices/meetingsSlice';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import LoadingButton from '../../components/LoadingButton';
import { useToast } from '../../components/ToastProvider';

const MeetingsPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    meetingId: string;
    action: string;
    title: string;
    message: string;
  }>({
    isOpen: false,
    meetingId: '',
    action: '',
    title: '',
    message: ''
  });
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const { meetings, isLoading, error } = useAppSelector((state) => state.meetings);
  const { services } = useAppSelector((state) => state.services);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Format time to readable format
  const formatTime = (timeString: string) => {
    try {
      // Handle both full datetime and time-only strings
      let date;
      if (timeString.includes('T')) {
        date = new Date(timeString);
      } else {
        // If it's just time, create a date object for today with that time
        const [hours, minutes] = timeString.split(':');
        date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      
      return date.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return timeString;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = (meetingId: string, newStatus: string) => {
    const meeting = meetings.find(m => m.id.toString() === meetingId);
    if (!meeting) return;

    // פעולות שדורשות אישור
    if (newStatus === 'cancelled') {
      setConfirmDialog({
        isOpen: true,
        meetingId,
        action: newStatus,
        title: 'ביטול פגישה',
        message: 'האם אתה בטוח שברצונך לבטל את הפגישה? פעולה זו לא ניתנת לביטול.'
      });
      return;
    }

    // פעולות רגילות ללא אישור
    performStatusUpdate(meetingId, newStatus);
  };

  const performStatusUpdate = async (meetingId: string, newStatus: string) => {
    try {
      setIsUpdating(meetingId);
      await dispatch(updateMeeting({
        id: meetingId,
        data: { status: newStatus as 'confirmed' | 'pending' | 'cancelled' | 'completed' }
      })).unwrap();
      
      showSuccess(
        'הפגישה עודכנה',
        'סטטוס הפגישה עודכן בהצלחה'
      );
    } catch (_error) {
      showError(
        'שגיאה בעדכון',
        'אירעה שגיאה בעדכון הפגישה. אנא נסה שוב.'
      );
    } finally {
      setIsUpdating(null);
    }
  };

  const handleConfirmAction = () => {
    performStatusUpdate(confirmDialog.meetingId, confirmDialog.action);
    setConfirmDialog({
      isOpen: false,
      meetingId: '',
      action: '',
      title: '',
      message: ''
    });
  };

  const handleCancelAction = () => {
    setConfirmDialog({
      isOpen: false,
      meetingId: '',
      action: '',
      title: '',
      message: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Meeting Management</h2>
        <div className="text-sm text-gray-600">
          {meetings.length} total meetings
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Meetings List */}
      <div className="space-y-4">
        {meetings.map((meeting) => {
          const service = services.find(s => s.id === meeting.service_id);
          return (
            <div key={meeting.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{service?.name}</h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(meeting.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(meeting.status)}`}>
                        {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">{meeting.client?.name}</p>
                        <p>{meeting.client?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">{formatDate(meeting.date)}</p>
                        <p>{formatTime(meeting.start_time)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">{service?.duration} minutes</p>
                        <p>${service?.price}</p>
                      </div>
                    </div>
                  </div>

                  {meeting.notes && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {meeting.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:ml-6">
                  {meeting.status === 'pending' && (
                    <>
                      <LoadingButton
                        onClick={() => handleStatusChange(meeting.id.toString(), 'confirmed')}
                        isLoading={isUpdating === meeting.id.toString()}
                        variant="success"
                        size="sm"
                      >
                        אישור
                      </LoadingButton>
                      <LoadingButton
                        onClick={() => handleStatusChange(meeting.id.toString(), 'cancelled')}
                        isLoading={isUpdating === meeting.id.toString()}
                        variant="danger"
                        size="sm"
                      >
                        ביטול
                      </LoadingButton>
                    </>
                  )}
                  {meeting.status === 'confirmed' && (
                    <>
                      <LoadingButton
                        onClick={() => handleStatusChange(meeting.id.toString(), 'completed')}
                        isLoading={isUpdating === meeting.id.toString()}
                        variant="primary"
                        size="sm"
                      >
                        סיום
                      </LoadingButton>
                      <LoadingButton
                        onClick={() => handleStatusChange(meeting.id.toString(), 'cancelled')}
                        isLoading={isUpdating === meeting.id.toString()}
                        variant="secondary"
                        size="sm"
                      >
                        ביטול
                      </LoadingButton>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {meetings.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No meetings scheduled yet</p>
            <p className="text-sm text-gray-500">Meetings will appear here when clients book your services</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="אישור"
        cancelText="ביטול"
        type="danger"
        isLoading={isUpdating !== null}
      />
    </div>
  );
};

export default MeetingsPage;