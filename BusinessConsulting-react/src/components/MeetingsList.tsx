import React from 'react';
import { Calendar, Clock, Search } from 'lucide-react';
import { Service, Meeting } from '../types';
import StatusBadge from './StatusBadge';

interface MeetingsListProps {
  meetings: Meeting[];
  services: Service[];
  isLoading: boolean;
  error?: string | null;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

const MeetingsList: React.FC<MeetingsListProps> = ({
  meetings,
  services,
  isLoading,
  error,
  onClearFilters,
  hasActiveFilters = false
}) => {
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // No meetings at all
  if (meetings.length === 0 && !hasActiveFilters) {
    return (
      <div className="text-center py-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">לא נמצאו פגישות</p>
          <p className="text-sm text-gray-500">עדיין לא קבעת פגישות</p>
        </div>
      </div>
    );
  }

  // No results after filtering
  if (meetings.length === 0 && hasActiveFilters) {
    return (
      <div className="text-center py-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">לא נמצאו פגישות המתאימות לחיפוש</p>
          <p className="text-sm text-gray-500 mb-4">נסה לשנות את תנאי החיפוש או הסינון</p>
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              נקה כל הסינונים
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => {
        const service = services.find(s => s.id === meeting.service_id);
        return (
          <div key={meeting.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{service?.name || 'שירות לא זמין'}</h3>
                  <StatusBadge status={meeting.status} />
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
                      <p className="font-medium text-gray-900">{service?.duration || '---'} minutes</p>
                      <p>${service?.price || '---'}</p>
                    </div>
                  </div>
                </div>

                {meeting.notes && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <strong>הערות:</strong> {meeting.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MeetingsList;
