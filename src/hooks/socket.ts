import { io } from "socket.io-client";

export const socket = io("https://circle-app-be-production.up.railway.app", {
  autoConnect: false,
});
