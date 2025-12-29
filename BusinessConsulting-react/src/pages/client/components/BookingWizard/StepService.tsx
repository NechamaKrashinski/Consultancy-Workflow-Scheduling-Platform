import React from 'react';
import { Service } from '../../../../types';
import ServiceSearch from '../../../../components/ServiceSearch';

interface StepServiceProps {
  services: Service[];
  onSelect: (service: Service) => void;
}

const StepService: React.FC<StepServiceProps> = ({ services, onSelect }) => {
  return (
    <ServiceSearch
      services={services}
      onServiceSelect={onSelect}
      isLoading={false}
    />
  );
};

export default StepService;