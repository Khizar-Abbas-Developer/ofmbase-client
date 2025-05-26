// socket.js
import { io } from "socket.io-client";
const ServerURL = import.meta.env.VITE_PUBLIC_BASE_URL;
const socket = io(ServerURL); // Replace with your backend URL

export default socket;
