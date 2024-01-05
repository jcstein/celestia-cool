import { useState, useEffect, useRef } from 'react';
import celestiaLogo from '/celestia.svg';
import './App.css';

function App() {
  const [headerData, setHeaderData] = useState({ height: 'Loading...', time: 'Waiting...' });
  const [lastTime, setLastTime] = useState('Loading...');
  const [maxBytes, setMaxBytes] = useState('Loading...');
  const [abciInfo, setAbciInfo] = useState({
    data: 'Loading...',
    version: 'Loading...',
  });
  const [unconfirmedTxs, setUnconfirmedTxs] = useState('Loading...');
  const [unconfirmedTxsBytes, setUnconfirmedTxsBytes] = useState('Loading...');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseHeader = await fetch('https://rpc.lunaroasis.net/header');
        const dataHeader = await responseHeader.json();
        const rawTime = new Date(dataHeader.result.header.time);
    
        const formattedTime = rawTime.toLocaleString('en-DE', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric'
        });

        if (headerData.time !== formattedTime) {
          setLastTime(headerData.time);
        }
    
        setHeaderData({
          height: dataHeader.result.header.height,
          time: formattedTime
        });

        const responseParams = await fetch('https://rpc.lunaroasis.net/consensus_params');
        const dataParams = await responseParams.json();
        const maxBytesInBytes = dataParams.result.consensus_params.block.max_bytes;
        
        setMaxBytes(maxBytesInBytes);

        const responseAbci = await fetch('https://rpc.lunaroasis.net/abci_info');
        const dataAbci = await responseAbci.json();
        setAbciInfo(dataAbci.result.response);

        const responseUnconfirmedTxs = await fetch('https://rpc.lunaroasis.net/unconfirmed_txs');
        const dataUnconfirmedTxs = await responseUnconfirmedTxs.json();
        setUnconfirmedTxs(dataUnconfirmedTxs.result.n_txs);
        setUnconfirmedTxsBytes(dataUnconfirmedTxs.result.total_bytes);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };    

    fetchData();
    const interval = setInterval(fetchData, 2500);

    return () => clearInterval(interval);
  }, [headerData]);

  const logoRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (logoRef.current !== null) {
      logoRef.current.classList.add('spin');
      setTimeout(() => {
        if (logoRef.current !== null) {
          logoRef.current.classList.remove('spin');
        }
      }, 1000);
    }
  }, [headerData.height]);

  return (
    <div className="terminal">
      <div className="terminal-header">
        <a href="https://celestia.org" target="_blank">
          <img ref={logoRef} src={celestiaLogo} className="logo" alt="Celestia logo" />
        </a>
        <h1 className="terminal-title">celestia.cool</h1>
      </div>
      <div className="terminal-body">
        <table>
          <tbody>
            <tr>
              <td>Current block:</td>
              <td>{headerData.height}</td>
            </tr>
            <tr>
              <td>Time of current block:</td>
              <td>{headerData.time}</td>
            </tr>
            <tr>
              <td>Time of last block:</td>
              <td>{lastTime}</td>
            </tr>
            <tr>
              <td>Max bytes per block:</td>
              <td>{maxBytes} bytes</td>
            </tr>
            <tr>
              <td>Binary:</td>
              <td>{abciInfo.data} v{abciInfo.version}</td>
            </tr>
            <tr>
              <td>Unconfirmed transactions:</td>
              <td>{unconfirmedTxs}</td>
            </tr>
            <tr>
              <td>Unconfirmed transactions bytes:</td>
              <td>{unconfirmedTxsBytes} bytes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="hacker-docs">
        Celestia is a modular data availability network that securely scales with the number of users, making it easy for anyone to launch their own blockchain. This site is <a href="https://github.com/jcstein/celestia-cool">open source</a>.
      </p>
      </div>
  );
}

export default App;
