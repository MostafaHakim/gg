import { createSlice } from '@reduxjs/toolkit';
const savedUser = localStorage.getItem('em_user');
const authSlice = createSlice({ name: 'auth', initialState: { user: savedUser ? JSON.parse(savedUser) : null, token: localStorage.getItem('em_token') || null }, reducers: {
  setCredentials(state, action) { state.user = action.payload.user; state.token = action.payload.token; localStorage.setItem('em_user', JSON.stringify(action.payload.user)); localStorage.setItem('em_token', action.payload.token); },
  logout(state) { state.user = null; state.token = null; localStorage.removeItem('em_user'); localStorage.removeItem('em_token'); }
} });
export const { setCredentials, logout } = authSlice.actions; export default authSlice.reducer;
