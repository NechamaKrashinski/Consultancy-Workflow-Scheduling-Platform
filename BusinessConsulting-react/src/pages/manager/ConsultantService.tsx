import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchServices } from '../../store/slices/servicesSlice';
import { fetchConsultants } from '../../store/slices/businessConsultantSlice'; 
import { consultantServiceAPI } from '../../services/api';
import { Link ,Unlink} from 'lucide-react';

const ConsultantLinking: React.FC = () => {
  const dispatch = useAppDispatch();
  const { services } = useAppSelector((state) => state.services);
  const { consultants } = useAppSelector((state) => state.consultants);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [selectedConsultants, setSelectedConsultants] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        setSuccessMessage('The link was created successfully! Thank you!');
        setIsVisible(true);
        setTimeout(() => {
          setIsVisible(false);
          setSuccessMessage(null);
        }, 5000);
      } catch (error) {
        setSelectedConsultants([]);
        setSelectedServiceId('');
        setErrorMessage('There was an error creating the link. Please try again.');
        setIsVisible(true);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Link Consultants to Service</h2>

      {isVisible && successMessage && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 p-6 mb-4 text-white bg-gradient-to-r from-green-400 to-blue-500 rounded-lg shadow-lg transition-all duration-300 ease-in-out`}>
          <div className="flex items-center">
            <Link className="h-8 w-8 mr-3" />
            <span className="font-semibold text-lg">{successMessage}</span>
            <button onClick={() => setIsVisible(false)} className="ml-auto text-white hover:text-gray-200">
              ✖
            </button>
          </div>
        </div>
      )}

      {isVisible && errorMessage && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 p-6 mb-4 text-white bg-red-500 rounded-lg shadow-lg transition-all duration-300 ease-in-out`}>
          <div className="flex items-center">
            <Unlink className="h-8 w-8 mr-3" />
            <span className="font-semibold text-lg">{errorMessage}</span>
            <button onClick={() => setIsVisible(false)} className="ml-auto text-white hover:text-gray-200">
              ✖
            </button>
          </div>
        </div>
      )}

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
