import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import GameControl from './components/GameControl';
import DealerBoard from './components/DealerBoard';
import RoundControl from './components/RoundControl';
import PlayersBoard from './components/PlayersBoard';
import GameHandlers from './gameHandlers';
import GameTable from './components/GameTable';

const ws = new WebSocket('ws://localhost:3001/ws');
const gameHandlers = new GameHandlers(ws);

function App() {
  const [data, setData] = useState({});

  useEffect(() => {
    ws.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    ws.onmessage = (message) => {
      const response = JSON.parse(message.data);
      if (response.status === 200) {
        setData(response);
        console.log(response);
      } else if (response.status === 400) {
        toast.warn(response.message);
      } else {
        console.error(response);
        toast.error(response.message);
      }
    };
  }, []);

  return (< >
    <ToastContainer theme="colored" />
    <div className='game'>
      <DealerBoard playerId={data?.clientId} dealer={data?.state?.dealer} turn={data?.state?.selectedPlayerId} />
      <GameControl handlers={gameHandlers} actions={data?.state?.allowedMoves} />
      <GameTable />
      <RoundControl handlers={gameHandlers} actions={data?.state?.allowedMoves} />
      <PlayersBoard playerId={data?.clientId} players={data?.state?.players} turn={data?.state?.selectedPlayerId} />
    </div>
  </>
  );
}

export default App;
