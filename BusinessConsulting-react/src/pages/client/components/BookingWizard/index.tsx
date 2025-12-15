import React, { useState } from 'react';
// שימי לב: כאן 4 נקודות זה נכון כי אנחנו בתוך תיקייה פנימית
import { Service, BusinessConsultant } from '../../../../types';
import { meetingsAPI } from '../../../../services/api';
import { useToast } from '../../../../components/ToastProvider';
import { useAppSelector } from '../../../../hooks/redux';

// ייבוא הקומפוננטות שנמצאות לידנו באותה תיקייה
import WizardProgressBar from './WizardProgressBar';
import StepService from './StepService';
import StepConsultant from './StepConsultant';
import StepTime from './StepTime';
import StepConfirm from './StepConfirm';
import StepSuccess from './StepSuccess';

interface BookingWizardProps {
  user: any;
}

const BookingWizard: React.FC<BookingWizardProps> = ({ user }) => {
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

  const { services } = useAppSelector((state) => state.services);
  const { showSuccess, showError, showWarning } = useToast();

  // Helpers
  const getNext7Days = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i < 8; i++) { 
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      const year = nextDate.getFullYear();
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDate.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    return dates;
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes + duration, 0, 0);
    return endDate.toTimeString().slice(0, 5);
  };

  // Handlers
  const handleServiceSelect = async (service: Service) => {
    setSelectedService(service);
    setIsBookingLoading(true);
    try {
      const consultantsData = await meetingsAPI.getConsultantsByService(service.id.toString());
      setConsultants(consultantsData);
      setStep('consultants');
    } catch (error) {
      showError('שגיאה בטעינת יועצים', 'אנא נסה שוב מאוחר יותר');
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
      const availableTimes = await meetingsAPI.getAvailableTimes(dates, [consultant.id], selectedService.id);
      setAvailableSlots(availableTimes);
      setStep('times');
    } catch (error) {
      showError('שגיאה בטעינת זמנים', 'לא ניתן לטעון את הזמנים הפנויים.');
    } finally {
      setIsBookingLoading(false);
    }
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
      const currentAvailableTimes = await meetingsAPI.getAvailableTimes(
          [selectedDate], 
          [selectedConsultant.id],
          selectedService.id 
      );
      
      const availableSlots = currentAvailableTimes[selectedConsultant.id]?.[selectedDate] || [];
      
      const isStillAvailable = availableSlots.some((slot: { start: string; businessHourId: number }) => {
        const serverTime = slot.start.toString().trim().substring(0, 5); 
        const myTime = selectedTime.toString().trim().substring(0, 5);
        // eslint-disable-next-line eqeqeq
        const isIdMatch = slot.businessHourId == selectedBusinessHourId;
        return serverTime === myTime && isIdMatch;
      });
      
      if (!isStillAvailable) {
        showWarning('זמן תפוס', 'הזמן שבחרת כבר אינו זמין. אנא בחר זמן אחר.');
        await handleConsultantSelect(selectedConsultant);
        return;
      }

      if (!user?.id) {
        showError('שגיאה באימות', 'פרטי המשתמש לא נמצאו.');
        return;
      }

      const calculatedEndTime = calculateEndTime(selectedTime, selectedService.duration);

      const meetingData = {
        businessHourId: selectedBusinessHourId,
        serviceId: selectedService.id,
        clientId: user.id,
        consultantId: selectedConsultant.id,
        startTime: selectedTime,
        endTime: calculatedEndTime,
        business_hour_id: selectedBusinessHourId,
        service_id: selectedService.id,
        client_id: user.id,
        consultant_id: selectedConsultant.id,
        start_time: selectedTime,
        end_time: calculatedEndTime,
        date: selectedDate,
        notes: notes || ''
      };

      await meetingsAPI.createMeeting(meetingData);
      showSuccess('פגישה נוצרה בהצלחה!', 'הפגישה שלך נוספה למערכת.');
      setStep('success');

    } catch (error: any) {
      const msg = error.response?.data?.message || 'שגיאה כללית';
      showError('שגיאה ביצירת פגישה', msg);
    } finally {
      setIsBookingLoading(false);
    }
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
    <div className="space-y-6">
      {step !== 'success' && <WizardProgressBar currentStep={step} />}

      {step === 'services' && (
        <StepService 
            services={services} 
            onSelect={handleServiceSelect} 
        />
      )}

      {step === 'consultants' && (
        <StepConsultant
          consultants={consultants}
          selectedService={selectedService}
          onSelect={handleConsultantSelect}
          onBack={() => setStep('services')}
          isLoading={isBookingLoading}
        />
      )}

      {step === 'times' && (
        <StepTime
          availableSlots={availableSlots}
          selectedService={selectedService}
          selectedConsultant={selectedConsultant}
          onTimeSelect={handleTimeSelect}
          onBack={() => setStep('consultants')}
          isLoading={isBookingLoading}
        />
      )}

      {step === 'confirm' && (
        <StepConfirm
          selectedService={selectedService}
          selectedConsultant={selectedConsultant}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          notes={notes}
          setNotes={setNotes}
          onConfirm={handleConfirmBooking}
          onBack={() => setStep('times')}
          isLoading={isBookingLoading}
        />
      )}

      {step === 'success' && (
        <StepSuccess
          selectedService={selectedService}
          selectedConsultant={selectedConsultant}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onReset={resetBooking}
        />
      )}
    </div>
  );
};

export default BookingWizard;