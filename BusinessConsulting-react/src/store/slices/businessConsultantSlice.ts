import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { businessConsultantAPI } from '../../services/api';
import type { BusinessConsultant } from '../../types';

const initialState = {
  consultants: [] as BusinessConsultant[],
  isLoading: false,
  error: null as string | null,
};

// Async thunks
export const fetchConsultants = createAsyncThunk<BusinessConsultant[], void>(
  'consultants/fetchConsultants',
  async (_, { rejectWithValue }) => {
    try {
      const consultants = await businessConsultantAPI.getAllConsultants();
      return consultants;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch consultants');
    }
  }
);

export const fetchConsultantById = createAsyncThunk<BusinessConsultant, string>(
  'consultants/fetchConsultantById',
  async (id, { rejectWithValue }) => {
    try {
      const consultant = await businessConsultantAPI.getConsultantById(id);
      return consultant;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch consultant');
    }
  }
);

export const createConsultant = createAsyncThunk<BusinessConsultant, { name: string; password: string; email: string; role: string }>(
  'consultants/createConsultant',
  async (data, { rejectWithValue }) => {
    try {
      const consultant = await businessConsultantAPI.createConsultant(data);
      return consultant;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create consultant');
    }
  }
);

export const updateConsultant = createAsyncThunk<BusinessConsultant, { id: string; data: { name?: string; password?: string; email?: string; role?: string } }>(
  'consultants/updateConsultant',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const consultant = await businessConsultantAPI.updateConsultant(id, data);
      return consultant;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update consultant');
    }
  }
);

export const deleteConsultant = createAsyncThunk<string, string>(
  'consultants/deleteConsultant',
  async (id, { rejectWithValue }) => {
    try {
      await businessConsultantAPI.deleteConsultant(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete consultant');
    }
  }
);

const consultantsSlice = createSlice({
  name: 'consultants',
  initialState,
  reducers: {
    clearConsultantsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch consultants
      .addCase(fetchConsultants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConsultants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.consultants = action.payload;
        state.error = null;
      })
      .addCase(fetchConsultants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch consultant by ID
      .addCase(fetchConsultantById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConsultantById.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.consultants.findIndex(consultant => consultant.id === action.payload.id);
        if (index === -1) {
          state.consultants.push(action.payload);
        }
        state.error = null;
      })
      .addCase(fetchConsultantById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create consultant
      .addCase(createConsultant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createConsultant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.consultants.push(action.payload);
        state.error = null;
      })
      .addCase(createConsultant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update consultant
      .addCase(updateConsultant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateConsultant.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.consultants.findIndex(consultant => consultant.id === action.payload.id);
        if (index !== -1) {
          state.consultants[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateConsultant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete consultant
      .addCase(deleteConsultant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteConsultant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.consultants = state.consultants.filter(consultant => String(consultant.id) !== String(action.payload));
        state.error = null;
      })
      .addCase(deleteConsultant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearConsultantsError } = consultantsSlice.actions;
export default consultantsSlice.reducer;
