import { useEffect } from 'react';
import './App.css';

const ws = new WebSocket('ws://localhost:3001/ws');

function App() {

  useEffect(() => {
    ws.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    ws.onmessage = (message) => {
      const serverMessage = JSON.parse(message.data);
      console.log(serverMessage);
    };
  }, []);

  function handleClick() {
    const data = { message: "test message" };
    ws.send(JSON.stringify(data));
  }

  function handleDisconnect() {
    ws.close();
  }

  return (
    <div>
      <button onClick={handleClick}>Send</button>
      <button onClick={handleDisconnect}>Diisconnect</button>
    </div>
  );
}

export default App;
