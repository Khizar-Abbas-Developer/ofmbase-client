// socket.js
import { io } from "socket.io-client";
const socket = io("https://ofmbase-production.up.railway.app", {
  transports: ["websocket"], // force websocket
  withCredentials: true,
});
export default socket;
