import React from 'react';
import { Search, Filter, Calendar, X } from 'lucide-react';

interface MeetingsFilterProps {
  searchQuery: string;
  statusFilter: 'all' | 'booked' | 'pending' | 'confirmed' | 'cancelled' | 'completed';
  dateFilter: 'all' | 'upcoming' | 'past' | 'today';
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: 'all' | 'booked' | 'pending' | 'confirmed' | 'cancelled' | 'completed') => void;
  onDateFilterChange: (filter: 'all' | 'upcoming' | 'past' | 'today') => void;
  onClearFilters: () => void;
  totalMeetings: number;
  filteredMeetings: number;
}

const MeetingsFilter: React.FC<MeetingsFilterProps> = ({
  searchQuery,
  statusFilter,
  dateFilter,
  onSearchChange,
  onStatusFilterChange,
  onDateFilterChange,
  onClearFilters,
  totalMeetings,
  filteredMeetings
}) => {
  const hasActiveFilters = searchQuery || statusFilter !== 'all' || dateFilter !== 'all';

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Meetings</h2>
          <p className="text-sm text-gray-600">
            {filteredMeetings} of {totalMeetings} meetings
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="חפש פגישות (שם שירות, הערות, תאריך)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value as typeof statusFilter)}
                className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">כל הסטטוסים</option>
                <option value="booked">שמור</option>
                <option value="pending">ממתין לאישור</option>
                <option value="confirmed">מאושר</option>
                <option value="completed">הושלם</option>
                <option value="cancelled">מבוטל</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => onDateFilterChange(e.target.value as typeof dateFilter)}
                className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">כל התאריכים</option>
                <option value="today">היום</option>
                <option value="upcoming">עתידיות</option>
                <option value="past">עברו</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center whitespace-nowrap"
              >
                <X className="h-4 w-4 mr-2" />
                נקה סינונים
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                חיפוש: "{searchQuery}"
                <button
                  onClick={() => onSearchChange('')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                סטטוס: {
                  statusFilter === 'booked' ? 'שמור' :
                  statusFilter === 'pending' ? 'ממתין לאישור' :
                  statusFilter === 'confirmed' ? 'מאושר' :
                  statusFilter === 'completed' ? 'הושלם' : 'מבוטל'
                }
                <button
                  onClick={() => onStatusFilterChange('all')}
                  className="ml-2 text-emerald-600 hover:text-emerald-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {dateFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                תאריך: {
                  dateFilter === 'today' ? 'היום' :
                  dateFilter === 'upcoming' ? 'עתידיות' : 'עברו'
                }
                <button
                  onClick={() => onDateFilterChange('all')}
                  className="ml-2 text-amber-600 hover:text-amber-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingsFilter;
