// socket.js
import { io } from "socket.io-client";
const socket = io("https://ofmbase-production.up.railway.app"); // Replace with your backend URL

export default socket;
