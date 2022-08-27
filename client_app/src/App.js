import { useEffect, useState } from 'react';
import './App.css';

const ws = new WebSocket('ws://localhost:3001/ws');

function App() {

  const [bet, setBet] = useState(0);
  const [playerName, setPlayerName] = useState("");


  useEffect(() => {
    ws.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    ws.onmessage = (message) => {
      const game = JSON.parse(message.data);
      console.log(game);
    };
  }, []);

  function sendWebSocket(data) {
    ws.send(JSON.stringify(data));
  }

  function handleDisconnect() {
    ws.close();
    console.log("WebSocket Client Disconnected")
  }

  return (
    <div className='game'>
      <div className='control'>
        <div>
          <input placeholder='name' type="text" onChange={e => setPlayerName(e.target.value)}></input>
          <button name="registerClient" onClick={() => sendWebSocket({ name: "registerClient", params: { name: playerName } })}>Register</button>
        </div>
        <button name="startGame" onClick={() => sendWebSocket({ name: "startGame", params: {} })}>Start Game</button>
        <div>
          <input placeholder='bet' type="number" onChange={e => setBet(parseInt(e.target.value))}></input>
          <button name="bet" onClick={() => sendWebSocket({ name: "bet", params: { amount: bet } })}>Bet</button>
        </div>
        <button name="hit" onClick={() => sendWebSocket({ name: "hit", params: {} })}>Hit</button>
        <button name="stand" onClick={() => sendWebSocket({ name: "stand", params: {} })}>Stand</button>
        <button name="exitGame" onClick={() => sendWebSocket({ name: "exitGame", params: {} })}>Exit Game</button>
        <button name="Diisconnect" onClick={handleDisconnect}>Diisconnect</button>
        <button onClick={() => sendWebSocket({ name: "asdsad", params: {} })}>Invalid Command</button>
      </div>
      <div>

      </div>
    </div>
  );
}

export default App;
