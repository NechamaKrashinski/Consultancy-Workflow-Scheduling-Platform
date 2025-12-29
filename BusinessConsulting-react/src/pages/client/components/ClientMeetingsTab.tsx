import React, { useState, useMemo } from 'react';
import { useAppSelector } from '../../../hooks/redux';
import { StatusFilter, DateFilter } from '../../../types/filters';
import MeetingFiltersComponent from '../../../components/MeetingFilters';
import MeetingsList from '../../../components/MeetingsList';

const ClientMeetingsTab: React.FC = () => {
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const { meetings, isLoading, error } = useAppSelector((state) => state.meetings);
  const { services } = useAppSelector((state) => state.services);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter('all');
  };

  // Filter logic
  const filteredMeetings = useMemo(() => {
    let filtered = [...meetings];
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(meeting => {
        const service = services.find(s => s.id === meeting.service_id);
        return (
          service?.name.toLowerCase().includes(query) ||
          meeting.notes?.toLowerCase().includes(query) ||
          meeting.date.includes(query)
        );
      });
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(meeting => meeting.status === statusFilter);
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(meeting => {
        const meetingDate = new Date(meeting.date);
        meetingDate.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
          case 'today':
            return meetingDate.getTime() === today.getTime();
          case 'upcoming':
            return meetingDate.getTime() >= today.getTime();
          case 'past':
            return meetingDate.getTime() < today.getTime();
          default:
            return true;
        }
      });
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [meetings, services, searchQuery, statusFilter, dateFilter]);

  return (
    <div className="space-y-6">
      <MeetingFiltersComponent
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        dateFilter={dateFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        onDateFilterChange={setDateFilter}
        onClearFilters={clearFilters}
        totalMeetings={meetings.length}
        filteredMeetings={filteredMeetings.length}
        userRole="client"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <MeetingsList
        meetings={filteredMeetings}
        services={services}
        isLoading={isLoading}
        error={error}
        onClearFilters={clearFilters}
        hasActiveFilters={searchQuery !== '' || statusFilter !== 'all' || dateFilter !== 'all'}
      />
    </div>
  );
};

export default ClientMeetingsTab;