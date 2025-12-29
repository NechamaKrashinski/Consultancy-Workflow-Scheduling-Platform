// Meeting status types
export type MeetingStatus = 'booked' | 'pending' | 'confirmed' | 'cancelled' | 'completed';

// Date filter types
export type DateFilter = 'all' | 'today' | 'upcoming' | 'past';

// Combined filter status including 'all' option
export type StatusFilter = 'all' | MeetingStatus;

// Filter interfaces
export interface MeetingFilters {
  searchQuery: string;
  statusFilter: StatusFilter;
  dateFilter: DateFilter;
  consultantFilter?: number | 'all'; // Optional for manager view
  serviceFilter?: number | 'all'; // Optional future enhancement
}

// Filter change handlers
export interface FilterHandlers {
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: StatusFilter) => void;
  onDateFilterChange: (filter: DateFilter) => void;
  onConsultantFilterChange?: (consultantId: number | 'all') => void;
  onServiceFilterChange?: (serviceId: number | 'all') => void;
  onClearFilters: () => void;
}

// Status display configuration
export interface StatusConfig {
  icon: JSX.Element;
  color: string;
  textColor: string;
  borderColor: string;
  label: string;
}

// Filter statistics
export interface FilterStats {
  totalMeetings: number;
  filteredMeetings: number;
}
