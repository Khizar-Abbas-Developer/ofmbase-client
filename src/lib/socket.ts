// socket.js
import { io } from "socket.io-client";
const URL = import.meta.env.VITE_PUBLIC_BASE_URL;

const socket = io(URL, {
  transports: ["websocket"], // force websocket
  withCredentials: true,
});
export default socket;
