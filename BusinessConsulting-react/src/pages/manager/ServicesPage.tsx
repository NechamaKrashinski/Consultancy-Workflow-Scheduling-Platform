import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  createService,
  updateService,
  deleteService,
} from "../../store/slices/servicesSlice";
import { Plus, Edit2, Trash2, DollarSign, Clock, Tag } from "lucide-react";
import type { CreateServiceData } from "../../types";
import { fetchConsultants } from "../../store/slices/consultantServiceSlice"; // ייבוא של האקשן
import {  consultantServiceAPI } from "../../services/api";

const ServicesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<number | undefined>(
    undefined
  );
  const [formData, setFormData] = useState({
    id: undefined,
    name: "",
    description: "",
    price: "",
    duration: "",
  });
  const [selectedConsultants, setSelectedConsultants] = useState<string[]>([]);

  const dispatch = useAppDispatch();
  const { services, isLoading, error } = useAppSelector(
    (state) => state.services
  );

  const { consultants } = useAppSelector((state) => state.consultants);
  useEffect(() => {
    dispatch(fetchConsultants());
  }, [dispatch]);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const serviceData: CreateServiceData = {
        id: formData.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
    };

    if (editingService !== undefined) {
        // עדכון שירות קיים
        const resultAction = await dispatch(
            updateService({ id: editingService, data: serviceData })
        );
        if (updateService.fulfilled.match(resultAction)) {
            // שליחה של כל יועץ במקביל
            const promises = selectedConsultants.map(consultantId => 
                consultantServiceAPI.createConsultantService({
                    service_id: editingService.toString(),
                    consultant_id: consultantId,
                })
            );
            await Promise.all(promises);
        }
    } else {
        // יצירת שירות חדש
        const resultAction = await dispatch(createService(serviceData));
        if (createService.fulfilled.match(resultAction)) {
            const service_id = resultAction.payload.id; 

            // שליחה של כל יועץ במקביל
            const promises = selectedConsultants.map(consultantId => 
                consultantServiceAPI.createConsultantService({
                    service_id: service_id!.toString(),
                    consultant_id: consultantId,
                })
            );
            await Promise.all(promises);
        }
    }

    // איפוס הנתונים
    setFormData({
        id: undefined,
        name: "",
        description: "",
        price: "",
        duration: "",
    });
    setSelectedConsultants([]); // איפוס היועצים הנבחרים
    setEditingService(undefined);
    setShowForm(false);
};


  const handleEdit = (service: any) => {
    setFormData({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
    });
    setEditingService(service.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      dispatch(deleteService(id));
    }
  };

  const handleCancel = () => {
    setFormData({
      id: undefined,
      name: "",
      description: "",
      price: "",
      duration: "",
    });
    setEditingService(undefined);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Service Management</h2>
        <button
          onClick={() => setShowForm(true)}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Service Form */}
      {showForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold mb-4">
            {editingService != -1 ? "Edit Service" : "Add New Service"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter service name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe your service"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  required
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="60"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Business Consultants
              </label>
              {consultants.map((consultant) => (
                <div key={consultant.id}>
                  <label>
                    <input
                      type="checkbox"
                      value={consultant.id}
                      checked={selectedConsultants.includes(consultant.id.toString())}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedConsultants((prev) =>
                          prev.includes(id)
                            ? prev.filter((c) => c !== id)
                            : [...prev, id]
                        );
                      }}
                    />
                    {consultant.name}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {editingService !== undefined
                  ? "Update Service"
                  : "Add Service"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {service.name}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Tag className="h-4 w-4 mr-1" />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(service)}
                  disabled={isLoading}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete((service.id ?? "").toString())}
                  disabled={isLoading}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-3">
              {service.description}
            </p>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex items-center text-emerald-600 font-semibold">
                <DollarSign className="h-4 w-4 mr-1" />
                {service.price}
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {service.duration} min
              </div>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <p className="text-gray-600 mb-4">No services added yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Add Your First Service
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
