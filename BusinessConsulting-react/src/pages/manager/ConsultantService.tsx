import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchServices } from '../../store/slices/servicesSlice';
import { fetchConsultants } from '../../store/slices/businessConsultantSlice'; 
import { consultantServiceAPI } from '../../services/api';
import { useToast } from '../../components/ToastProvider';

const ConsultantLinking: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const dispatch = useAppDispatch();
  const { services } = useAppSelector((state) => state.services);
  const { consultants } = useAppSelector((state) => state.consultants);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [selectedConsultants, setSelectedConsultants] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchServices());
    dispatch(fetchConsultants());
  }, [dispatch]);

  const handleServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedServiceId(event.target.value);
  };

  const handleConsultantToggle = (consultantId: string) => {
    setSelectedConsultants((prev) => 
      prev.includes(consultantId) 
        ? prev.filter(id => id !== consultantId) 
        : [...prev, consultantId]
    );
  };

  const handleSubmit = async () => {
    if (selectedServiceId) {
      try {
        await Promise.all(selectedConsultants.map(consultantId => 
          consultantServiceAPI.createConsultantService({ service_id: selectedServiceId, consultant_id: consultantId })
        ));
        setSelectedConsultants([]);
        setSelectedServiceId('');
        showSuccess(
          'קישור נוצר בהצלחה!',
          'הקישור בין היועצים לשירות נוצר בהצלחה. תודה!'
        );
      } catch (_error) {
        setSelectedConsultants([]);
        setSelectedServiceId('');
        showError(
          'שגיאה ביצירת קישור',
          'הייתה שגיאה ביצירת הקישור. אנא נסה שוב.'
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Link Consultants to Service</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
        <select onChange={handleServiceChange} value={selectedServiceId} className="w-full px-4 py-3 border border-gray-300 rounded-xl">
          <option value="">Select a service</option>
          {services.map(service => (
            <option key={service.id} value={service.id}>{service.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Consultants</h3>
        {consultants.map(consultant => (
          <div key={consultant.id} className="flex items-center">
            <input
              type="checkbox"
              id={consultant.id.toString()}
              checked={selectedConsultants.includes(consultant.id.toString())}
              onChange={() => handleConsultantToggle(consultant.id.toString())}
              className="mr-2"
            />
            <label htmlFor={consultant.id.toString()} className="text-gray-700">{consultant.name}</label>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
      >
        Link Consultants
      </button>
    </div>
  );
};

export default ConsultantLinking;
