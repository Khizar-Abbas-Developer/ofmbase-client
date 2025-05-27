import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Match the Mongoose schema structure
interface Notification {
  message: string;
  forId?: string;
  type?: "content-request";
  moduleName: string;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface NotificationsState {
  notifications: Notification[];
}

const initialState: NotificationsState = {
  notifications: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Add a single notification
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
    },

    // Add multiple notifications at once
    addNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
    },

    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, addNotifications, clearNotifications } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;
