import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Service, BusinessConsultant } from '../../../../types';

interface StepConfirmProps {
  selectedService: Service | null;
  selectedConsultant: BusinessConsultant | null;
  selectedDate: string;
  selectedTime: string;
  notes: string;
  setNotes: (notes: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const StepConfirm: React.FC<StepConfirmProps> = ({
  selectedService,
  selectedConsultant,
  selectedDate,
  selectedTime,
  notes,
  setNotes,
  onConfirm,
  onBack,
  isLoading,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Confirm Your Booking</h2>
        <button
          onClick={onBack}
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
          onClick={onConfirm}
          disabled={isLoading}
          className="w-full mt-6 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          {isLoading ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
};

export default StepConfirm;