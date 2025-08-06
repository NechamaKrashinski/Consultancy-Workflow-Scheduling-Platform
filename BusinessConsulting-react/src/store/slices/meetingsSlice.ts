import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { meetingsAPI } from '../../services/api';
import type { MeetingState, CreateMeetingData, UpdateMeetingData, Meeting } from '../../types';

const initialState: MeetingState = {
  meetings: [] as Meeting[],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchMeetings = createAsyncThunk<Meeting[], void>(
  'meetings/fetchMeetings',
  async (_, { rejectWithValue }) => {
    try {
      const meetings = await meetingsAPI.getMeetings();
      return meetings;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch meetings');
    }
  }
);



export const fetchClientMeetings = createAsyncThunk<Meeting[], void>(
  'meetings/fetchClientMeetings',
  async (_, { rejectWithValue }) => {
    try {
      const meetings = await meetingsAPI.getClientMeetings();
      return meetings;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch client meetings');
    }
  }
);

export const fetchManagerMeetings = createAsyncThunk<Meeting[], void>(
  'meetings/fetchManagerMeetings',
  async (_, { rejectWithValue }) => {
    try {
      const meetings = await meetingsAPI.getManagerMeetings();
      return meetings;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch manager meetings');
    }
  }
);

export const createMeeting = createAsyncThunk<Meeting, CreateMeetingData>(
  'meetings/createMeeting',
  async (data, { rejectWithValue }) => {
    try {
      const meeting = await meetingsAPI.createMeeting(data);
      return meeting;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create meeting');
    }
  }
);

export const updateMeeting = createAsyncThunk<Meeting, { id: string; data: UpdateMeetingData }>(
  'meetings/updateMeeting',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const meeting = await meetingsAPI.updateMeeting(id, data);
      return meeting;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update meeting');
    }
  }
);

export const deleteMeeting = createAsyncThunk<string, string>(
  'meetings/deleteMeeting',
  async (id, { rejectWithValue }) => {
    try {
      await meetingsAPI.deleteMeeting(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete meeting');
    }
  }
);

const meetingsSlice = createSlice({
  name: 'meetings',
  initialState,
  reducers: {
    clearMeetingsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch meetings
      .addCase(fetchMeetings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMeetings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.meetings = action.payload;
        state.error = null;
      })
      .addCase(fetchMeetings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
    
      
      // Fetch client meetings
      .addCase(fetchClientMeetings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClientMeetings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.meetings = action.payload;
        state.error = null;
      })
      .addCase(fetchClientMeetings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch manager meetings
      .addCase(fetchManagerMeetings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchManagerMeetings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.meetings = action.payload;
        state.error = null;
      })
      .addCase(fetchManagerMeetings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create meeting
      .addCase(createMeeting.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.isLoading = false;
        state.meetings.push(action.payload);
        state.error = null;
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update meeting
      .addCase(updateMeeting.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.meetings.findIndex(meeting => meeting.id === action.payload.id);
        if (index !== -1) {
          state.meetings[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateMeeting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete meeting
      .addCase(deleteMeeting.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        state.isLoading = false;
        state.meetings = state.meetings.filter(meeting => String(meeting.id) !== String(action.payload));
        state.error = null;
      })
      .addCase(deleteMeeting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMeetingsError } = meetingsSlice.actions;
export default meetingsSlice.reducer;