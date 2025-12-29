import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { MeetingStatus } from '../types/filters';

interface StatusBadgeProps {
  status: MeetingStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md', 
  showIcon = true, 
  showText = true 
}) => {
  const getStatusConfig = (status: MeetingStatus) => {
    switch (status) {
      case 'booked':
        return {
          icon: <Calendar className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} text-blue-600`} />,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          label: 'שמור'
        };
      case 'pending':
        return {
          icon: <AlertCircle className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} text-amber-600`} />,
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-200',
          label: 'ממתין לאישור'
        };
      case 'confirmed':
        return {
          icon: <CheckCircle className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} text-emerald-600`} />,
          bgColor: 'bg-emerald-100',
          textColor: 'text-emerald-800',
          borderColor: 'border-emerald-200',
          label: 'מאושר'
        };
      case 'completed':
        return {
          icon: <CheckCircle className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} text-blue-600`} />,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          label: 'הושלם'
        };
      case 'cancelled':
        return {
          icon: <XCircle className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} text-red-600`} />,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          label: 'מבוטל'
        };
      default:
        return {
          icon: <Clock className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} text-gray-600`} />,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          label: status
        };
    }
  };

  const config = getStatusConfig(status);
  const paddingClass = size === 'sm' ? 'px-2 py-1' : size === 'lg' ? 'px-4 py-2' : 'px-3 py-1';
  const textSizeClass = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <span 
      className={`inline-flex items-center ${paddingClass} rounded-full ${textSizeClass} font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {showIcon && (
        <span className={showText ? 'mr-1' : ''}>
          {config.icon}
        </span>
      )}
      {showText && config.label}
    </span>
  );
};

export default StatusBadge;
