import React from 'react';
import { Calendar, Clock, Upload, User } from 'lucide-react';

interface DashboardTabsProps {
  activeTab: 'book-meeting' | 'my-meetings' | 'upload-files' | 'view-profile';
  setActiveTab: (tab: 'book-meeting' | 'my-meetings' | 'upload-files' | 'view-profile') => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'book-meeting', label: 'Book Meeting', icon: Calendar },
    { id: 'my-meetings', label: 'My Meetings', icon: Clock },
    { id: 'upload-files', label: 'Upload Files', icon: Upload },
    { id: 'view-profile', label: 'My Profile', icon: User },
  ] as const;

  return (
    <div className="flex space-x-1 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default DashboardTabs;