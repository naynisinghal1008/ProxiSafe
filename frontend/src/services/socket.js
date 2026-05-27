import io from 'socket.io-client';

// Create socket connection
export const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
    transports: ['websocket'],
    autoConnect: true
});

// Add event listeners
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('error', (error) => {
    console.error('Socket error:', error);
}); 