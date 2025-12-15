import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchServices } from '../../store/slices/servicesSlice';
import { fetchClientMeetings } from '../../store/slices/meetingsSlice';
import { logout } from '../../store/slices/authSlice';
import { LogOut, Calendar, Clock, CheckCircle, User, ArrowLeft, Upload } from 'lucide-react';
import { Service, BusinessConsultant } from '../../types';
import { StatusFilter, DateFilter } from '../../types/filters';
import { meetingsAPI } from '../../services/api';
import { useToast } from '../../components/ToastProvider';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import ServiceSearch from '../../components/ServiceSearch';
import MeetingFiltersComponent from '../../components/MeetingFilters';
import MeetingsList from '../../components/MeetingsList';
import ProfileUploadPage from './ProfileUploadPage';
import ProfileViewPage from '../ProfileViewPage';

const ClientDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'book-meeting' | 'my-meetings' | 'upload-files' | 'view-profile'>('book-meeting');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  
  // Booking states
  const [step, setStep] = useState<'services' | 'consultants' | 'times' | 'confirm' | 'success'>('services');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<BusinessConsultant | null>(null);
  const [consultants, setConsultants] = useState<BusinessConsultant[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedBusinessHourId, setSelectedBusinessHourId] = useState<number | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Record<string, Record<string, { start: string; businessHourId: number }[]>>>({});
  const [notes, setNotes] = useState<string>('');
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { services } = useAppSelector((state) => state.services);
  const { meetings, isLoading, error } = useAppSelector((state) => state.meetings);
  const { showSuccess, showError, showWarning } = useToast();

  useEffect(() => {
    dispatch(fetchServices());
    if (activeTab === 'my-meetings') {
      dispatch(fetchClientMeetings());
    }
  }, [dispatch, activeTab]);

  useEffect(() => {
    console.log('availableSlots updated', availableSlots);
  }, [availableSlots]); 

  useEffect(() => {
  console.log('🔹 availableSlots updated:', availableSlots);
  }, [availableSlots]);
 
  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
      showSuccess(
        'התנתקות בוצעה',
        'התנתקת בהצלחה מהמערכת'
      );
    } catch (_error) {
      // אם יש שגיאה, עדיין נתנתק כי זה logout
      dispatch(logout());
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  // Booking functions
  const handleServiceSelect = async (service: Service) => {
    setSelectedService(service);
    setIsBookingLoading(true);
    
    try {
      const consultantsData = await meetingsAPI.getConsultantsByService(service.id.toString());
      console.log('consultantsData', consultantsData);
      setConsultants(consultantsData);
      setStep('consultants');
    } catch (error) {
      console.error('❌ Error fetching consultants:', error);
      
      // Type guard לבדיקת axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown; status?: number } };
        console.error('Error details:', axiosError.response?.data);
        console.error('Error status:', axiosError.response?.status);
        
        // נראה הודעה ברורה למשתמש
        if (axiosError.response?.status === 401) {
          showError('נדרשת התחברות מחדש', 'אנא התחבר מחדש למערכת');
        } else if (axiosError.response?.status === 403) {
          showError('אין הרשאה', 'אין לך הרשאה לצפות ביועצים');
        } else {
          showError('שגיאה בטעינת יועצים', 'אנא נסה שוב מאוחר יותר');
        }
      } else {
        showError('שגיאה בטעינת יועצים', 'אנא נסה שוב מאוחר יותר');
      }
      
      // במקרה של שגיאה, נגדיר array ריק כדי שה-map לא יקרוס
      setConsultants([]);
    } finally {
      setIsBookingLoading(false);
    }
  };


  const handleConsultantSelect = async (consultant: BusinessConsultant) => {
    if (!selectedService) {
      showError('בחר שירות', 'אנא בחר שירות לפני בחירת יועץ.');
      return;
    }
  
    setSelectedConsultant(consultant);
    setIsBookingLoading(true);
    
    try {
      const dates = getNext7Days();
      console.log(`🔎 Fetching times for consultant ${consultant.id} on dates:`, dates);

      const availableTimes = await meetingsAPI.getAvailableTimes(
        dates,
        [consultant.id],
        selectedService.id
      );
      
      console.log('📦 Raw Available Times Response:', JSON.stringify(availableTimes, null, 2));
      
      // בדיקה האם האובייקט ריק
      if (!availableTimes || Object.keys(availableTimes).length === 0) {
          console.warn('⚠️ Server returned empty object for available times');
      }

      setAvailableSlots(availableTimes);
      setStep('times');

    } catch (error) {
      console.error('❌ Error fetching available times:', error);
      showError('שגיאה בטעינת זמנים', 'לא ניתן לטעון את הזמנים הפנויים. אנא נסה שוב.');
    } finally {
      setIsBookingLoading(false);
    }
  };


  const getNext7Days = () => {
      const dates = [];
      const today = new Date();

      for (let i = 1; i < 8; i++) { 
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);

        // תיקון: יצירת מחרוזת תאריך מקומית ידנית כדי למנוע בעיות אזורי זמן
        const year = nextDate.getFullYear();
        const month = String(nextDate.getMonth() + 1).padStart(2, '0');
        const day = String(nextDate.getDate()).padStart(2, '0');

        dates.push(`${year}-${month}-${day}`);
      }
      console.log('📅 Generated Dates for query:', dates); // לוג לבדיקה
      return dates;
  };

  const handleTimeSelect = (date: string, time: string, businessHourId: number) => {
    console.log('Selected time:', date, time, businessHourId);
    setSelectedDate(date);
    setSelectedTime(time);
    setSelectedBusinessHourId(businessHourId);
    setStep('confirm');
  };

  const handleConfirmBooking = async () => {
    // 1. וידוא שכל הנתונים קיימים
    if (!selectedService || !selectedConsultant || !selectedDate || !selectedTime || !selectedBusinessHourId) {
        showWarning('נתונים חסרים', 'אנא וודא שכל פרטי הפגישה נבחרו כראוי');
        return;
    }

    setIsBookingLoading(true);

    try {
      console.log('🔄 Validating availability before booking...');
      
      // --- התיקון נמצא כאן: הוספנו את selectedService.id כפרמטר שלישי ---
      const currentAvailableTimes = await meetingsAPI.getAvailableTimes(
          [selectedDate], 
          [selectedConsultant.id],
          selectedService.id // <--- זה היה חסר!
      );
      
      const availableSlots = currentAvailableTimes[selectedConsultant.id]?.[selectedDate] || [];
      
      // לוגיקה לבדיקת התאמה (בדיוק כמו שרצינו)
      const isStillAvailable = availableSlots.some((slot: { start: string; businessHourId: number }) => {
        // נרמול השעה (התעלמות משניות)
        const serverTime = slot.start.toString().trim().substring(0, 5); 
        const myTime = selectedTime.toString().trim().substring(0, 5);
        
        // נרמול ה-ID (השוואת מחרוזות)
        // eslint-disable-next-line eqeqeq
        const isIdMatch = slot.businessHourId == selectedBusinessHourId;

        return serverTime === myTime && isIdMatch;
      });
      
      if (!isStillAvailable) {
        console.error('❌ Validation Failed. Slots from server:', availableSlots);
        showWarning('זמן תפוס', 'הזמן שבחרת כבר אינו זמין (נתפס ברגעים אלו). אנא בחר זמן אחר.');
        await handleConsultantSelect(selectedConsultant);
        return;
      }

      if (!user?.id) {
        showError('שגיאה באימות', 'פרטי המשתמש לא נמצאו. אנא התחבר מחדש.');
        return;
      }

      // חישוב זמן סיום (שימוש בפונקציה החיצונית הקיימת בקובץ)
      const calculatedEndTime = calculateEndTime(selectedTime, selectedService.duration);

      const meetingData = {
        // CamelCase
        businessHourId: selectedBusinessHourId,
        serviceId: selectedService.id,
        clientId: user.id,
        consultantId: selectedConsultant.id,
        startTime: selectedTime,
        endTime: calculatedEndTime,
        
        // snake_case לגיבוי לשרת
        business_hour_id: selectedBusinessHourId,
        service_id: selectedService.id,
        client_id: user.id,
        consultant_id: selectedConsultant.id,
        start_time: selectedTime,
        end_time: calculatedEndTime,
        
        date: selectedDate,
        notes: notes || ''
      };

      console.log('🚀 Sending confirmed booking:', meetingData);

      await meetingsAPI.createMeeting(meetingData);
      
      showSuccess('פגישה נוצרה בהצלחה!', 'הפגישה שלך נוספה למערכת. תקבל אישור בקרוב.');
      setStep('success');

    } catch (error: any) {
      console.error('❌ Error creating meeting:', error);
      
      if (error.response) {
          console.error('Server Data:', error.response.data); 
          const msg = error.response.data.message || error.response.statusText;
          showError('שגיאת שרת', `השרת לא אישר את הפגישה: ${msg}`);
      } else {
          showError('שגיאה ביצירת פגישה', 'לא ניתן היה ליצור את הפגישה. אנא נסה שוב.');
      }
    } finally {
      setIsBookingLoading(false);
    }
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes + duration, 0, 0);
    return endDate.toTimeString().slice(0, 5);
  };

  const resetBooking = () => {
    setStep('services');
    setSelectedService(null);
    setSelectedConsultant(null);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedBusinessHourId(null);
    setNotes('');
    setConsultants([]);
    setAvailableSlots({});
  };

  // Filter and search functions for meetings
  const filteredMeetings = useMemo(() => {
    let filtered = [...meetings];
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(meeting => {
        const service = services.find(s => s.id === meeting.service_id);
        return (
          service?.name.toLowerCase().includes(query) ||
          meeting.notes?.toLowerCase().includes(query) ||
          meeting.date.includes(query)
        );
      });
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(meeting => meeting.status === statusFilter);
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
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [meetings, services, searchQuery, statusFilter, dateFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter('all');
  };

  const tabs = [
    { id: 'book-meeting', label: 'Book Meeting', icon: Calendar },
    { id: 'my-meetings', label: 'My Meetings', icon: Clock },
    { id: 'upload-files', label: 'Upload Files', icon: Upload },
    { id: 'view-profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
                <p className="text-gray-600">Welcome, {user?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'book-meeting' | 'my-meetings' | 'upload-files')}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'book-meeting' && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="flex items-center space-x-4">
              {['services', 'consultants', 'times', 'confirm'].map((stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === stepName ? 'bg-blue-600 text-white' :
                    ['services', 'consultants', 'times', 'confirm'].indexOf(step) > index ? 'bg-emerald-600 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 3 && <div className="w-12 h-1 bg-gray-200 mx-2" />}
                </div>
              ))}
            </div>

            {/* Step 1: Select Service */}
            {step === 'services' && (
              <ServiceSearch
                services={services}
                onServiceSelect={handleServiceSelect}
                isLoading={false}
              />
            )}

            {/* Step 2: Select Consultant */}
            {step === 'consultants' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Choose a Consultant</h2>
                    <p className="text-gray-600">Service: {selectedService?.name}</p>
                  </div>
                  <button
                    onClick={() => setStep('services')}
                    className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </button>
                </div>
                
                {isBookingLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {consultants.map((consultant) => (
                      <div
                        key={consultant.id}
                        onClick={() => handleConsultantSelect(consultant)}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{consultant.name}</h3>
                            <p className="text-gray-600">{consultant.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Select Time */}
            {step === 'times' && selectedService && selectedConsultant && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Choose Date & Time</h2>
                    <p className="text-gray-600">
                      Service: {selectedService?.name} | Consultant: {selectedConsultant?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep('consultants')}
                    className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </button>
                </div>

                {isBookingLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      const consultantSlots = availableSlots[selectedConsultant?.id || ''] || {};
                      const slotsWithTimes = Object.entries(consultantSlots)
                        .filter(([, slots]) => slots && slots.length > 0);
                      
                      return slotsWithTimes.map(([date, slots]) => (
                        <div key={date} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {new Date(date).toLocaleDateString('he-IL', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </h3>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {(slots as { start: string; businessHourId: number }[]).map((slot, index) => (
                              <button
                                key={index}
                                onClick={() => handleTimeSelect(date, slot.start, slot.businessHourId)}
                                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                              >
                                {slot.start}
                              </button>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                    
                    {Object.keys(availableSlots[selectedConsultant?.id || ''] || {}).length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No available times found for this consultant.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Confirm Booking */}
            {step === 'confirm' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">Confirm Your Booking</h2>
                  <button
                    onClick={() => setStep('times')}
                    className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </button>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Service:</span>
                      <span className="text-gray-900">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Consultant:</span>
                      <span className="text-gray-900">{selectedConsultant?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Date:</span>
                      <span className="text-gray-900">
                        {new Date(selectedDate).toLocaleDateString('he-IL')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Time:</span>
                      <span className="text-gray-900">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Duration:</span>
                      <span className="text-gray-900">{selectedService?.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Price:</span>
                      <span className="text-gray-900 font-semibold">${selectedService?.price}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Any specific requirements or questions?"
                    />
                  </div>

                  <button
                    onClick={handleConfirmBooking}
                    disabled={isBookingLoading}
                    className="w-full mt-6 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {isBookingLoading ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Success */}
            {step === 'success' && (
              <div className="text-center py-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Booking Successful!</h2>
                  <p className="text-gray-600 mb-6">
                    Your meeting has been booked successfully. You will receive a confirmation email shortly.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <p><strong>Service:</strong> {selectedService?.name}</p>
                    <p><strong>Consultant:</strong> {selectedConsultant?.name}</p>
                    <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('he-IL')}</p>
                    <p><strong>Time:</strong> {selectedTime}</p>
                  </div>
                  <button
                    onClick={resetBooking}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Book Another Meeting
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-meetings' && (
          <div className="space-y-6">
            <MeetingFiltersComponent
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              dateFilter={dateFilter}
              onSearchChange={setSearchQuery}
              onStatusFilterChange={setStatusFilter}
              onDateFilterChange={setDateFilter}
              onClearFilters={clearFilters}
              totalMeetings={meetings.length}
              filteredMeetings={filteredMeetings.length}
              userRole="client"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <MeetingsList
              meetings={filteredMeetings}
              services={services}
              isLoading={isLoading}
              error={error}
              onClearFilters={clearFilters}
              hasActiveFilters={searchQuery !== '' || statusFilter !== 'all' || dateFilter !== 'all'}
            />
          </div>
        )}

        {activeTab === 'upload-files' && (
          <div>
            <ProfileUploadPage />
          </div>
        )}

        {activeTab === 'view-profile' && (
          <div>
            <ProfileViewPage />
          </div>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showLogoutDialog}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
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