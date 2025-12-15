import React from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { BusinessConsultant, Service } from '../../../../types';

interface StepConsultantProps {
  consultants: BusinessConsultant[];
  selectedService: Service | null;
  onSelect: (consultant: BusinessConsultant) => void;
  onBack: () => void;
  isLoading: boolean;
}

const StepConsultant: React.FC<StepConsultantProps> = ({
  consultants,
  selectedService,
  onSelect,
  onBack,
  isLoading,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Choose a Consultant</h2>
          <p className="text-gray-600">Service: {selectedService?.name}</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
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
              onClick={() => onSelect(consultant)}
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
  );
};

export default StepConsultant;