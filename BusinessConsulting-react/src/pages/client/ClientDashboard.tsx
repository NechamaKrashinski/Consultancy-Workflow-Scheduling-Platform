import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchServices } from '../../store/slices/servicesSlice';
import { createMeeting } from '../../store/slices/meetingsSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { LogOut, Calendar, Clock, DollarSign, Tag, CheckCircle } from 'lucide-react';
import type { CreateMeetingData } from '../../types';

const ClientDashboard: React.FC = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    notes: ''
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { services, isLoading: servicesLoading } = useAppSelector((state) => state.services);
  const { isLoading: meetingsLoading } = useAppSelector((state) => state.meetings);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);
  

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleBookService = (service: any) => {
    setSelectedService(service);
    setShowBookingForm(true);
    setBookingSuccess(false);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const meetingData: CreateMeetingData = {
      serviceId: selectedService.id,
      date: bookingData.date,
      time: bookingData.time,
      notes: bookingData.notes
    };

    const result = await dispatch(createMeeting(meetingData));
    
    if (createMeeting.fulfilled.match(result)) {
      setBookingSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setShowBookingForm(false);
        setSelectedService(null);
        setBookingData({
          date: '',
          time: '',
          notes: ''
        });
        setBookingSuccess(false);
      }, 3000);
    }
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Book a Service</h1>
                <p className="text-gray-600">Welcome, {user?.name}</p>
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
        {/* Services Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Services</h2>
          
          {servicesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-200 group">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Tag className="h-4 w-4 mr-1" />
                      {/* {service.category} */}
                    </div>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-emerald-600 font-semibold text-lg">
                      <DollarSign className="h-5 w-5 mr-1" />
                      {service.price}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration} min
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookService(service)}
                    disabled={meetingsLoading}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium group-hover:shadow-lg disabled:opacity-50"
                  >
                    Book Meeting
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              {bookingSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Successful!</h3>
                  <p className="text-gray-600 mb-4">
                    Your meeting for <strong>{selectedService?.name}</strong> has been submitted.
                  </p>
                  <p className="text-sm text-gray-500">
                    The business manager will review and confirm your meeting shortly.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Book: {selectedService?.name}
                  </h3>
                  <form onSubmit={handleSubmitBooking} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                      <input
                        type="date"
                        required
                        value={bookingData.date}
                        onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                      <input
                        type="time"
                        required
                        value={bookingData.time}
                        onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                      <textarea
                        value={bookingData.notes}
                        onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Any specific requirements or questions?"
                      />
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        disabled={meetingsLoading}
                        className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                      >
                        {meetingsLoading ? 'Booking...' : 'Book Meeting'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowBookingForm(false);
                          setSelectedService(null);
                        }}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {services.length === 0 && !servicesLoading && (
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No services available at the moment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;