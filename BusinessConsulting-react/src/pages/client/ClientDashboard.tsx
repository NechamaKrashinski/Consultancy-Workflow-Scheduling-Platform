import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchServices } from '../../store/slices/servicesSlice';
import { fetchClientMeetings } from '../../store/slices/meetingsSlice';
import { logout } from '../../store/slices/authSlice';
import { LogOut, Calendar, Clock, CheckCircle, XCircle, AlertCircle, DollarSign, User, ArrowLeft } from 'lucide-react';
import { Service, BusinessConsultant } from '../../types';
import { meetingsAPI } from '../../services/api';
import { useToast } from '../../components/ToastProvider';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const ClientDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'book-meeting' | 'my-meetings'>('book-meeting');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
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
    if (!selectedService) return;
    
    setSelectedConsultant(consultant);
    setIsBookingLoading(true);

    try {
      const dates = getNext7Days();
      const availableTimes = await meetingsAPI.getAvailableTimes(dates, [consultant.id]);
      setAvailableSlots(availableTimes);
      setStep('times');
    } catch (error) {
      console.error('Error fetching available times:', error);
    } finally {
      setIsBookingLoading(false);
    }
  };

  const getNext7Days = () => {
    const dates = [];
    for (let i = 1; i < 8; i++) { // Start from 1 to exclude today
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const handleTimeSelect = (date: string, time: string, businessHourId: number) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setSelectedBusinessHourId(businessHourId);
    setStep('confirm');
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedConsultant || !selectedDate || !selectedTime || !selectedBusinessHourId) return;

    setIsBookingLoading(true);
    
    try {
      // בדיקה מחודשת של זמינות
      const currentAvailableTimes = await meetingsAPI.getAvailableTimes([selectedDate], [selectedConsultant.id]);
      const availableSlots = currentAvailableTimes[selectedConsultant.id]?.[selectedDate] || [];
      const isStillAvailable = availableSlots.some((slot: { start: string; businessHourId: number }) => 
        slot.start === selectedTime && slot.businessHourId === selectedBusinessHourId
      );
      
      if (!isStillAvailable) {
        showWarning('זמן תפוס', 'מצטערים, הזמן שבחרת כבר תפוס. אנא בחר זמן אחר.');
        await handleConsultantSelect(selectedConsultant);
        return;
      }

      if (!user?.id) {
        showError('שגיאה באימות', 'פרטי המשתמש לא נמצאו. אנא התחבר מחדש.');
        return;
      }

      const meetingData = {
        businessHourId: selectedBusinessHourId,
        serviceId: selectedService.id,
        clientId: user.id,
        date: selectedDate,
        startTime: selectedTime,
        endTime: calculateEndTime(selectedTime, selectedService.duration),
        notes: notes
      };

      await meetingsAPI.createMeeting(meetingData);
      showSuccess('פגישה נוצרה בהצלחה!', 'הפגישה שלך נוספה למערכת. תקבל אישור בקרוב.');
      setStep('success');
    } catch (error) {
      console.error('Error creating meeting:', error);
      showError('שגיאה ביצירת פגישה', 'לא ניתן היה ליצור את הפגישה. אנא נסה שוב.');
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
      let date;
      if (timeString.includes('T')) {
        date = new Date(timeString);
      } else {
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

  const tabs = [
    { id: 'book-meeting', label: 'Book Meeting', icon: Calendar },
    { id: 'my-meetings', label: 'My Meetings', icon: Clock },
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
                onClick={() => setActiveTab(tab.id as 'book-meeting' | 'my-meetings')}
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
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">Choose a Service</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-200 cursor-pointer group"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-emerald-600 font-semibold">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${service.price}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {service.duration} min
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
            {step === 'times' && (
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
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Meetings</h2>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
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
                  <p className="text-sm text-gray-500">Book your first meeting to get started</p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
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