import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import GameControl from './components/GameControl';
import DealerBoard from './components/DealerBoard';
import RoundControl from './components/RoundControl';
import PlayersBoard from './components/PlayersBoard';
import GameHandlers from './gameHandlers';

const blackjack_api = process.env.REACT_APP_BLACKJACK_API || "ws://localhost:3001";

const ws = new WebSocket(`${blackjack_api}/ws`);
const gameHandlers = new GameHandlers(ws);

function App() {
  const [data, setData] = useState({});
  const [disconnected, setDisconnected] = useState(false);

  useEffect(() => {
    ws.onopen = () => { };

    ws.onmessage = (message) => {
      const response = JSON.parse(message.data);
      if (response?.data === "heartbeat") return;
      if (response.status === 200) setData(response);
      else if (response.status === 400) toast.warn(response.message);
      else toast.error(response.message);
    };

    ws.onclose = () => setDisconnected(true);
  }, []);

  return (
    <>
      <nav className='disconnected' hidden={!disconnected}>Connection is lost. Please refresh your browser.</nav>
      <ToastContainer theme="colored" />
      <div className='game'>
        <GameControl handlers={gameHandlers} actions={data?.state?.allowedMoves} />
        <DealerBoard playerId={data?.clientId} dealer={data?.state?.dealer} turn={data?.state?.selectedPlayerId} />
        <PlayersBoard playerId={data?.clientId} players={data?.state?.players} turn={data?.state?.selectedPlayerId} />
        <RoundControl handlers={gameHandlers} actions={data?.state?.allowedMoves} configurations={data?.configurations} />
      </div>
    </>
  );
}

export default App;
