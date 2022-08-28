import { useEffect, useState } from 'react';
import './App.css';
import table from './assets/table.png';
import GameControl from './components/GameControl';
import DealerBoard from './components/DealerBoard';
import RoundControl from './components/RoundControl';
import PlayersBoard from './components/PlayersBoard';
import GameHandlers from './gameHandlers';

const ws = new WebSocket('ws://localhost:3001/ws');
const gameHandlers = new GameHandlers(ws);

function App() {
  const [data, setData] = useState({});

  useEffect(() => {
    ws.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    ws.onmessage = (message) => {
      const gameState = JSON.parse(message.data);
      console.log(gameState);
      setData(gameState);
    };
  }, []);

  return (
    <div className='game'>
      <section className='dealerboard'>
        <DealerBoard playerId={data?.clientId} dealer={data?.state?.dealer} turn={data?.state?.selectedPlayerId} />
      </section>
      <section className='gameboard'>
        <GameControl handlers={gameHandlers} actions={data?.state?.allowedMoves} />
        <div className='table'>
          <img className='table__img' src={table} alt="BlackJack table"></img>
        </div>
        <RoundControl handlers={gameHandlers} actions={data?.state?.allowedMoves} />
      </section>
      <section>
        <PlayersBoard playerId={data?.clientId} players={data?.state?.players} turn={data?.state?.selectedPlayerId} />
      </section>
    </div>
  );
}

export default App;
