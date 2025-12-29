import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Service, BusinessConsultant } from '../../../../types';

interface StepTimeProps {
  availableSlots: Record<string, Record<string, { start: string; businessHourId: number }[]>>;
  selectedService: Service | null;
  selectedConsultant: BusinessConsultant | null;
  onTimeSelect: (date: string, time: string, businessHourId: number) => void;
  onBack: () => void;
  isLoading: boolean;
}

const StepTime: React.FC<StepTimeProps> = ({
  availableSlots,
  selectedService,
  selectedConsultant,
  onTimeSelect,
  onBack,
  isLoading,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Choose Date & Time</h2>
          <p className="text-gray-600">
            Service: {selectedService?.name} | Consultant: {selectedConsultant?.name}
          </p>
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
        <div className="space-y-4">
          {(() => {
            const consultantSlots = availableSlots[selectedConsultant?.id || ''] || {};
            const slotsWithTimes = Object.entries(consultantSlots).filter(
              ([, slots]) => slots && slots.length > 0
            );

            return slotsWithTimes.map(([date, slots]) => (
              <div
                key={date}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {new Date(date).toLocaleDateString('he-IL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {(slots as { start: string; businessHourId: number }[]).map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => onTimeSelect(date, slot.start, slot.businessHourId)}
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
  );
};

export default StepTime;