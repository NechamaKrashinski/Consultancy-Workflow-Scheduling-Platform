import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchServices } from '../../store/slices/servicesSlice';
import { Clock, DollarSign, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { Service } from '../../types';
import { meetingsAPI } from '../../services/api';
import { useToast } from '../../components/ToastProvider';

interface Consultant {
  id: number;
  name: string;
  email: string;
}

interface TimeSlot {
  start: string;
  end: string;
  businessHourId: number;
}

interface AvailableSlots {
  [consultantId: string]: {
    [date: string]: TimeSlot[];
  };
}

const BookingPage: React.FC = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [step, setStep] = useState<'services' | 'consultants' | 'times' | 'confirm' | 'success'>('services');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedBusinessHourId, setSelectedBusinessHourId] = useState<number | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlots>({});
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();
  const { services } = useAppSelector((state) => state.services);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const handleServiceSelect = async (service: Service) => {
    setSelectedService(service);
    setIsLoading(true);
    
    try {
      // קבלת יועצים לשירות הנבחר
      const consultantsData = await meetingsAPI.getConsultantsByService(service.id.toString());
      setConsultants(consultantsData);
      setStep('consultants');
    } catch (error) {
      console.error('Error fetching consultants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsultantSelect = async (consultant: Consultant) => {
    if (!selectedService) {
      showError('בחר שירות', 'אנא בחר שירות לפני בחירת יועץ.');
      return;
    }

    setSelectedConsultant(consultant);
    setIsLoading(true);

    try {
      const dates = getNext7Days();
      const availableTimes = await meetingsAPI.getAvailableTimes(
        dates,
        [consultant.id],
        selectedService.id
      );

      setAvailableSlots(availableTimes);
      setStep('times');
    } catch (error) {
      console.error('Error fetching available times:', error);
      showError('שגיאה בטעינת זמנים', 'לא ניתן לטעון את הזמנים הפנויים. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };


  const getNext7Days = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
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

    setIsLoading(true);
    
    try {
      // בדיקה מחדש של זמינות לפני יצירת הפגישה
      const currentAvailableTimes = await meetingsAPI.getAvailableTimes(
        [selectedDate],
        [selectedConsultant.id],
        selectedService.id
      );
      
      const availableSlots = currentAvailableTimes[selectedConsultant.id]?.[selectedDate] || [];
      const isStillAvailable = availableSlots.some((slot: TimeSlot) => 
        slot.start === selectedTime && slot.businessHourId === selectedBusinessHourId
      );
      
      if (!isStillAvailable) {
        showWarning(
          'זמן תפוס',
          'מצטערים, הזמן שבחרת כבר תפוס. אנא בחר זמן אחר.'
        );
        // רענון הזמנים הפנויים
        await handleConsultantSelect(selectedConsultant);
        return;
      }

      // יצירת פגישה חדשה
      if (!user?.id) {
        showError(
          'שגיאת משתמש',
          'פרטי המשתמש לא נמצאו. אנא התחבר מחדש.'
        );
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

      try {
        await meetingsAPI.createMeeting(meetingData);
        showSuccess(
          'פגישה אושרה מיידית! 🎉',
          'הפגישה שלך אושרה ונקבעה בהצלחה! היועץ יכול לעדכן אם יש צורך בשינויים.'
        );
        setStep('success');
      } catch (error: unknown) {
        console.error('Server error:', error);
        
        // אם השגיאה היא שהזמן כבר תפוס, נרענן את הזמנים הפנויים
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('meeting already exists')) {
          showWarning(
            'זמן תפוס',
            'מצטערים, הזמן שבחרת כבר תפוס. הזמנים הפנויים מתעדכנים...'
          );
          
          // רענון הזמנים הפנויים עם קבלת נתונים עדכניים מהשרת
          const dates = getNext7Days();
          const refreshedAvailableTimes = await meetingsAPI.getAvailableTimes(
            dates,
            [selectedConsultant.id],
            selectedService.id
          );
          
          // עדכון ה-state עם הזמנים החדשים
          setAvailableSlots(refreshedAvailableTimes);
          setStep('times');
        } else {
          showError(
            'שגיאה ביצירת פגישה',
            'שגיאה ביצירת הפגישה. אנא נסה שוב.'
          );
        }
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      showError(
        'שגיאה ביצירת פגישה',
        'שגיאה ביצירת הפגישה. אנא נסה שוב.'
      );
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Book a Meeting</h1>
            {step !== 'services' && step !== 'success' && (
              <button
                onClick={() => {
                  if (step === 'consultants') setStep('services');
                  else if (step === 'times') setStep('consultants');
                  else if (step === 'confirm') setStep('times');
                }}
                className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 flex items-center space-x-4">
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
                      {service.price}
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
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Choose a Consultant</h2>
              <p className="text-gray-600">Service: {selectedService?.name}</p>
            </div>
            
            {isLoading ? (
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
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Choose Date & Time</h2>
              <p className="text-gray-600">
                Service: {selectedService?.name} | Consultant: {selectedConsultant?.name}
              </p>
            </div>

            {isLoading ? (
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
                      {slots.map((slot, index) => (
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
                
                {/* הודעה אם אין זמנים פנויים */}
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
            <h2 className="text-2xl font-semibold text-gray-900">Confirm Your Booking</h2>
            
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
                disabled={isLoading}
                className="w-full mt-6 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {isLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 'success' && (
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">פגישה אושרה מיידית! 🎉</h2>
              <p className="text-gray-600 mb-6">
                הפגישה שלך אושרה ונקבעה בהצלחה! תקבל אישור במייל בקרוב. היועץ יכול לעדכן אם יש צורך בשינויים.
              </p>
              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <p><strong>שירות:</strong> {selectedService?.name}</p>
                <p><strong>יועץ:</strong> {selectedConsultant?.name}</p>
                <p><strong>תאריך:</strong> {new Date(selectedDate).toLocaleDateString('he-IL')}</p>
                <p><strong>שעה:</strong> {selectedTime}</p>
              </div>
              <button
                onClick={resetBooking}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                הזמן פגישה נוספת
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;