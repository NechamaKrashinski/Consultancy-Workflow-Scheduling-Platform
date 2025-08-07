import React from 'react';
import { Search, Filter, Calendar, X, User, Briefcase } from 'lucide-react';
import { MeetingFilters, FilterHandlers, FilterStats, StatusFilter, DateFilter } from '../types/filters';
import { BusinessConsultant, Service } from '../types';

interface MeetingFiltersProps extends MeetingFilters, FilterHandlers, FilterStats {
  consultants?: BusinessConsultant[]; // For manager view
  services?: Service[]; // For future enhancement
  userRole?: 'client' | 'manager';
}

const MeetingFiltersComponent: React.FC<MeetingFiltersProps> = ({
  searchQuery,
  statusFilter,
  dateFilter,
  consultantFilter,
  serviceFilter,
  onSearchChange,
  onStatusFilterChange,
  onDateFilterChange,
  onConsultantFilterChange,
  onServiceFilterChange,
  onClearFilters,
  totalMeetings,
  filteredMeetings,
  consultants = [],
  services = [],
  userRole = 'client'
}) => {
  const hasActiveFilters = 
    searchQuery !== '' || 
    statusFilter !== 'all' || 
    dateFilter !== 'all' ||
    (consultantFilter !== undefined && consultantFilter !== 'all') ||
    (serviceFilter !== undefined && serviceFilter !== 'all');

  const getStatusLabel = (status: StatusFilter) => {
    switch (status) {
      case 'all': return 'כל הסטטוסים';
      case 'booked': return 'שמור';
      case 'pending': return 'ממתין לאישור';
      case 'confirmed': return 'מאושר';
      case 'completed': return 'הושלם';
      case 'cancelled': return 'מבוטל';
      default: return status;
    }
  };

  const getDateLabel = (filter: DateFilter) => {
    switch (filter) {
      case 'all': return 'כל התאריכים';
      case 'today': return 'היום';
      case 'upcoming': return 'עתידיות';
      case 'past': return 'עברו';
      default: return filter;
    }
  };

  const getConsultantName = (consultantId: number | 'all') => {
    if (consultantId === 'all') return 'כל היועצים';
    const consultant = consultants.find(c => c.id === consultantId);
    return consultant?.name || 'יועץ לא ידוע';
  };

  const getServiceName = (serviceId: number | 'all') => {
    if (serviceId === 'all') return 'כל השירותים';
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'שירות לא ידוע';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {userRole === 'manager' ? 'ניהול פגישות' : 'הפגישות שלי'}
          </h2>
          <p className="text-sm text-gray-600">
            {filteredMeetings} מתוך {totalMeetings} פגישות
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
                onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
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
                onChange={(e) => onDateFilterChange(e.target.value as DateFilter)}
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

            {/* Consultant Filter - Only for managers */}
            {userRole === 'manager' && consultants.length > 0 && onConsultantFilterChange && (
              <div className="relative">
                <select
                  value={consultantFilter || 'all'}
                  onChange={(e) => onConsultantFilterChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">כל היועצים</option>
                  {consultants.map((consultant) => (
                    <option key={consultant.id} value={consultant.id}>
                      {consultant.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}

            {/* Service Filter - Optional for future */}
            {services.length > 0 && onServiceFilterChange && (
              <div className="relative">
                <select
                  value={serviceFilter || 'all'}
                  onChange={(e) => onServiceFilterChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">כל השירותים</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}

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
                סטטוס: {getStatusLabel(statusFilter)}
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
                תאריך: {getDateLabel(dateFilter)}
                <button
                  onClick={() => onDateFilterChange('all')}
                  className="ml-2 text-amber-600 hover:text-amber-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {consultantFilter !== undefined && consultantFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                יועץ: {getConsultantName(consultantFilter)}
                <button
                  onClick={() => onConsultantFilterChange?.('all')}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {serviceFilter !== undefined && serviceFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                שירות: {getServiceName(serviceFilter)}
                <button
                  onClick={() => onServiceFilterChange?.('all')}
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
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

export default MeetingFiltersComponent;
