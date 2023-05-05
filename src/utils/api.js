import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.130/',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  adapter: config => {
    const socket = new WebSocket(config.url.replace('http', 'ws'));
    return new Promise((resolve, reject) => {
      socket.onopen = () => {
        socket.send(JSON.stringify(config.data));
      };
      socket.onmessage = event => {
        resolve({ data: JSON.parse(event.data) });
        socket.close();
      };
      socket.onerror = error => {
        reject(error);
        socket.close();
      };
    });
  },
});

export const shooting = () => {
  return api.get('ws');
}

