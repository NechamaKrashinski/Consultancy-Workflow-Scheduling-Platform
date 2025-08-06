import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchServices } from '../../store/slices/servicesSlice';
import { fetchManagerMeetings } from '../../store/slices/meetingsSlice';
import { fetchConsultants } from '../../store/slices/businessConsultantSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { LogOut, BarChart3, Calendar, Settings, Users } from 'lucide-react';
import ServicesPage from './ServicesPage';
import MeetingsPage from './MeetingsPage';
import ConsultantLinking from './ConsultantService'; // ייבוא הקומפוננטה החדשה

const ManagerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'meetings' | 'consultant-linking'>('overview'); // עדכון סוג ה-state
  
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { services } = useAppSelector((state) => state.services);
  const { meetings } = useAppSelector((state) => state.meetings);
  const { consultants } = useAppSelector((state) => state.consultants);

  useEffect(() => {
    dispatch(fetchServices());
    dispatch(fetchManagerMeetings());
    dispatch(fetchConsultants());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const stats = [
    {
      name: 'Total Services',
      value: services.length,
      icon: Settings,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Meetings',
      value: meetings.filter(apt => apt.status === 'booked').length,
      icon: Calendar,
      color: 'bg-emerald-500'
    },
    {
      name: 'Pending Approvals',
      value: meetings.filter(apt => apt.status === 'available').length,
      icon: Users,
      color: 'bg-amber-500'
    },
    {
      name: 'Total Consultants',
      value: consultants.length, // עדכון למספר הקונסולטנטים
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      name: 'Monthly Revenue',
      value: '\\$4,280',
      icon: BarChart3,
      color: 'bg-purple-500'
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'services', name: 'Services', icon: Settings },
    { id: 'meetings', name: 'Meetings', icon: Calendar },
    { id: 'consultant-linking', name: 'Consultant Linking', icon: Users } // טאב חדש
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white/60 backdrop-blur-sm p-1 rounded-xl border border-white/20">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.name} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-200">
                    <div className="flex items-center">
                      <div className={`${stat.color} p-3 rounded-xl`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Meetings</h3>
              <div className="space-y-3">
                {meetings.slice(0, 5).map((meeting) => {
                  return (
                    <div key={meeting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        {/* <p className="font-medium text-gray-900">{meeting.clientName}</p> */}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{meeting.date} at {meeting.start_time}</p>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          meeting.status === 'booked' ? 'bg-emerald-100 text-emerald-800' :
                          meeting.status === 'available' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {meeting.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && <ServicesPage />}

        {/* Meetings Tab */}
        {activeTab === 'meetings' && <MeetingsPage />}

        {/* Consultant Linking Tab */}
        {activeTab === 'consultant-linking' && <ConsultantLinking />} {/* הוספת הקומפוננטה החדשה */}
      </div>
    </div>
  );
};

export default ManagerDashboard;
