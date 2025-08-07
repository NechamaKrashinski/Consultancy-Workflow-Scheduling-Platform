import React, { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { updateMeeting, fetchManagerMeetings } from '../../store/slices/meetingsSlice';
import { fetchConsultants } from '../../store/slices/businessConsultantSlice';
import { Calendar, Clock, User } from 'lucide-react';
import { StatusFilter, DateFilter } from '../../types/filters';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import LoadingButton from '../../components/LoadingButton';
import MeetingFiltersComponent from '../../components/MeetingFilters';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/ToastProvider';

const MeetingsPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [consultantFilter, setConsultantFilter] = useState<number | 'all'>('all');
  
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
  const { consultants } = useAppSelector((state) => state.consultants);

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchManagerMeetings());
    dispatch(fetchConsultants());
  }, [dispatch]);

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

  // Filter logic for meetings
  const filteredMeetings = useMemo(() => {
    let filtered = [...meetings];
    
    // Debug: בואו נראה מה יש לנו במפגשים
    console.log('All meetings:', meetings);
    console.log('Consultant filter:', consultantFilter);
    console.log('Available consultants:', consultants);
    
    // Debug: בואו נראה איך נראית פגישה אחת
    if (meetings.length > 0) {
      console.log('First meeting structure:', meetings[0]);
      console.log('First meeting BusinessHour:', meetings[0].BusinessHour);
      console.log('First meeting BusinessHour.BusinessConsultant:', meetings[0].BusinessHour?.BusinessConsultant);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(meeting => {
        const service = services.find(s => s.id === meeting.service_id);
        const client = meeting.client;
        return (
          service?.name.toLowerCase().includes(query) ||
          client?.name.toLowerCase().includes(query) ||
          client?.email.toLowerCase().includes(query) ||
          meeting.notes?.toLowerCase().includes(query) ||
          meeting.date.includes(query)
        );
      });
      console.log('After search filter:', filtered.length);
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(meeting => meeting.status === statusFilter);
      console.log('After status filter:', filtered.length);
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(meeting => {
        const meetingDate = new Date(meeting.date);
        meetingDate.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
          case 'today':
            return meetingDate.getTime() === today.getTime();
          case 'upcoming':
            return meetingDate.getTime() >= today.getTime();
          case 'past':
            return meetingDate.getTime() < today.getTime();
          default:
            return true;
        }
      });
      console.log('After date filter:', filtered.length);
    }
    
    // Consultant filter
    if (consultantFilter !== 'all') {
      console.log('Before consultant filter - filtered meetings count:', filtered.length);
      console.log('Filtering by consultant ID:', consultantFilter, typeof consultantFilter);
      
      // בואו נבדוק פגישה אחת בפירוט מלא
      if (filtered.length > 0) {
        console.log('First meeting full structure:', JSON.stringify(filtered[0], null, 2));
      }
      
      filtered = filtered.filter(meeting => {
        const consultant = meeting.BusinessHour?.BusinessConsultant;
        console.log('Meeting consultant data:', {
          meetingId: meeting.id,
          businessHour: meeting.BusinessHour,
          consultant: consultant,
          consultantId: consultant?.id,
          consultantIdType: typeof consultant?.id,
          filterType: typeof consultantFilter,
          comparison: consultant?.id === consultantFilter,
          strictComparison: consultant?.id === Number(consultantFilter)
        });
        return consultant && consultant.id === Number(consultantFilter);
      });
      
      console.log('Filtered meetings by consultant:', filtered);
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [meetings, services, searchQuery, statusFilter, dateFilter, consultantFilter, consultants]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter('all');
    setConsultantFilter('all');
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
      {/* Filters */}
      <MeetingFiltersComponent
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        dateFilter={dateFilter}
        consultantFilter={consultantFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        onDateFilterChange={setDateFilter}
        onConsultantFilterChange={setConsultantFilter}
        onClearFilters={clearFilters}
        totalMeetings={meetings.length}
        filteredMeetings={filteredMeetings.length}
        consultants={consultants}
        userRole="manager"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Meetings List */}
      <div className="space-y-4">
        {filteredMeetings.map((meeting) => {
          const service = services.find(s => s.id === meeting.service_id);
          return (
            <div key={meeting.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{service?.name}</h3>
                    <StatusBadge status={meeting.status} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
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
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">יועץ:</p>
                        <p className="text-blue-600">{meeting.BusinessHour?.BusinessConsultant?.name || 'לא זמין'}</p>
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

      {/* No Results Messages */}
      {filteredMeetings.length === 0 && meetings.length > 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">לא נמצאו פגישות המתאימות לחיפוש</p>
            <p className="text-sm text-gray-500 mb-4">נסה לשנות את תנאי החיפוש או הסינון</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              נקה כל הסינונים
            </button>
          </div>
        </div>
      )}

      {meetings.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">אין פגישות מתוזמנות</p>
            <p className="text-sm text-gray-500">פגישות יופיעו כאן כאשר לקוחות יזמינו את השירותים שלך</p>
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