import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Service, BusinessConsultant } from '../../../../types';

interface StepSuccessProps {
  selectedService: Service | null;
  selectedConsultant: BusinessConsultant | null;
  selectedDate: string;
  selectedTime: string;
  onReset: () => void;
}

const StepSuccess: React.FC<StepSuccessProps> = ({
  selectedService,
  selectedConsultant,
  selectedDate,
  selectedTime,
  onReset,
}) => {
  return (
    <div className="text-center py-12">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Booking Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your meeting has been booked successfully. You will receive a confirmation email shortly.
        </p>
        <div className="space-y-2 text-sm text-gray-600 mb-6">
          <p>
            <strong>Service:</strong> {selectedService?.name}
          </p>
          <p>
            <strong>Consultant:</strong> {selectedConsultant?.name}
          </p>
          <p>
            <strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('he-IL')}
          </p>
          <p>
            <strong>Time:</strong> {selectedTime}
          </p>
        </div>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          Book Another Meeting
        </button>
      </div>
    </div>
  );
};

export default StepSuccess;