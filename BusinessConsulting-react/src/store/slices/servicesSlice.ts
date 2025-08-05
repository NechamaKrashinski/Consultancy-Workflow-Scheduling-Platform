import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { servicesAPI } from "../../services/api";
import type {
  ServicesState,
  CreateServiceData,
  UpdateServiceData,
  Service,
} from "../../types";

const initialState: ServicesState = {
  services: [] as Service[],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchServices = createAsyncThunk<Service[], void>(
  "services/fetchServices",
  async (_, { rejectWithValue }) => {
    try {
      const services = await servicesAPI.getServices();
      return services;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch services"
      );
    }
  }
);

export const createService = createAsyncThunk<Service, CreateServiceData>(
  "services/createService",
  async (data, { rejectWithValue }) => {
    try {
      console.log(data);
      
      const service = await servicesAPI.createService(data);
      return service;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create service"
      );
    }
  }
);


export const updateService = createAsyncThunk<
  Service,
  { id: number; data: UpdateServiceData }
>("services/updateService", async ({ id, data }, { rejectWithValue }) => {
  try {
    const service = await servicesAPI.updateService(id, data);
    return service;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to update service"
    );
  }
});

export const deleteService = createAsyncThunk<string, string>(
  "services/deleteService",
  async (id, { rejectWithValue }) => {
    try {
      await servicesAPI.deleteService(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete service"
      );
    }
  }
);

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    clearServicesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch services
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload;
        state.error = null;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch manager services

      // Create service
      .addCase(createService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services.push(action.payload);
        state.error = null;
      })
      .addCase(createService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update service
      .addCase(updateService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.services.findIndex(service => service.id === Number(action.meta.arg.id));
        if (index !== -1) {
          state.services[index] = action.meta.arg.data as Service;
        }
        state.error = null;
      })
      .addCase(updateService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete service
      .addCase(deleteService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = state.services.filter(
          (service) => service.id !== Number(action.payload)
        );
        state.error = null;
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearServicesError } = servicesSlice.actions;
export default servicesSlice.reducer;
