import { io } from 'socket.io-client';

const socket = io('http://localhost:8081', {
    withCredentials: true,
    reconnection: true,
    autoConnect: false // để chủ động connect sau khi login
});

export default socket;
