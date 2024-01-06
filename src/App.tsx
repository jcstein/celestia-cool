import { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import celestiaLogo from '/celestia.svg';
import './App.css';

function App() {
  const [headerData, setHeaderData] = useState({ height: 'Loading...', time: 'Waiting...' });
  const [lastTime, setLastTime] = useState('Waiting...');
  const [maxBytes, setMaxBytes] = useState('Loading...');
  const [abciInfo, setAbciInfo] = useState({
    data: 'Loading...',
    version: 'Loading...',
  });
  const [unconfirmedTxsCount, setUnconfirmedTxsCount] = useState<number[]>(Array(60).fill(0));
  const [unconfirmedTxsBytesCount, setUnconfirmedTxsBytesCount] = useState<number[]>(Array(60).fill(0));

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

        setHeaderData((prevHeaderData) => {
          const newTime = formattedTime;
          if (prevHeaderData.time !== newTime) {
            setLastTime(prevHeaderData.time);
          }
          return {
            height: dataHeader.result.header.height,
            time: newTime
          };
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
        setUnconfirmedTxsCount((prev) => [dataUnconfirmedTxs.result.n_txs, ...prev.slice(0, -1)]);
        setUnconfirmedTxsBytesCount((prev) => [dataUnconfirmedTxs.result.total_bytes, ...prev.slice(0, -1)]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);

    return () => clearInterval(interval);
  }, []);

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
        <a href="https://celestia.org" target="_blank" rel="noopener noreferrer">
          <img ref={logoRef} src={celestiaLogo} className="logo" alt="Celestia logo" />
        </a>
        <h1 className="terminal-title">celestia.cool</h1>
      </div>
      <div className="terminal-body">
      <text>a Celestia mempool visualizoooooor</text>
      <Bar
  data={{
    labels: Array.from({ length: 60 }, (_, i) => i === 0 ? 'now' : `${i} seconds ago`),
    datasets: [
      {
        label: 'Unconfirmed Transactions',
        data: unconfirmedTxsCount,
        backgroundColor: 'rgba(145,245,230,0.4)',
        borderColor: 'rgba(145,245,230,1)',
        borderWidth: 1,
        yAxisID: 'y-axis-count',
      },
      {
        label: 'Unconfirmed Transaction Bytes',
        data: unconfirmedTxsBytesCount,
        backgroundColor: 'rgba(253,99,217,0.4)',
        borderColor: 'rgba(253,99,217,1)',
        borderWidth: 1,
        yAxisID: 'y-axis-bytes',
      },
    ],
  }}
  options={{
    scales: {
      yAxes: [
        {
          id: 'y-axis-count',
          type: 'linear',
          position: 'left',
          scaleLabel: {
            display: true,
            labelString: 'Unconfirmed Transactions',
          },
        },
        {
          id: 'y-axis-bytes',
          type: 'linear',
          position: 'right',
          gridLines: {
            drawOnChartArea: false,
          },
          ticks: {
            beginAtZero: true,
          },
          scaleLabel: {
            display: true,
            labelString: 'Unconfirmed Transaction Bytes',
          },
        },
      ],
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  }}
/>
<br/>
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
              <td>{maxBytes}</td>
            </tr>
            <tr>
              <td>Binary:</td>
              <td>{abciInfo.version}</td>
            </tr>
            <tr>
              <td>Unconfirmed transactions:</td>
              <td>{unconfirmedTxsCount[0]}</td>
            </tr>
            <tr>
              <td>Unconfirmed transaction bytes:</td>
              <td>{unconfirmedTxsBytesCount[0]}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="terminal-footer">
        <text>
        Celestia is a modular data availability network that securely scales with the number of users, making it easy for anyone to launch their own blockchain. This site is <a href="https://github.com/jcstein/celestia-cool"> open source</a>. Data fetched from the <a href="https://rpc.lunaroasis.net">Lunar Oasis RPC</a>.
        </text>
      </div>
    </div>
  );
}

export default App;