// src/store/user/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the shape of the user state
interface UserState {
  currentUser: any | null; // Replace `any` with a proper type if available
  loading: boolean;
  error: boolean | string;
}

// Initial state with types
const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: false,
};

// Create the user slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
    },
    singInSuccess: (state, action: PayloadAction<any>) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = false;
    },
    singInFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    signOutUser: (state) => {
      state.loading = false;
      state.currentUser = null;
    },
    updateUserFields: (
      state,
      action: PayloadAction<Partial<typeof state.currentUser>>
    ) => {
      if (state.currentUser) {
        Object.entries(action.payload).forEach(([key, value]) => {
          // @ts-ignore to allow dynamic property assignment
          state.currentUser[key] = value;
        });
      }
    },
  },
});

// Export actions and reducer
export const {
  signInStart,
  singInSuccess,
  singInFailure,
  signOutUser,
  updateUserFields,
} = userSlice.actions;
export default userSlice.reducer;
