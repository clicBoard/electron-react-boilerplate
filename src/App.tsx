import React, { useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';
import { transponder } from './communicator';

const axios = require('axios');
const clipboardListener = require('clipboard-event');

const Hello = () => {
  transponder(ipcRenderer);
  useEffect(() => {
    clipboardListener.startListening();
    clipboardListener.on('change', () => {
      alert('Changed');
    });
  });

  clipboardListener.on('change', () => {
    alert('Changed');
  });

  const getClip = async () => {
    try {
      await axios
        .get('http://192.168.1.53:5000/WeatherForecast')
        .then((res) => {
          alert('console.log');
          return null;
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="Topbar">
        <svg viewBox="10 0 50 80">
          <text y="50">clicBoard</text>
        </svg>
      </div>

      <div className="Sidebar">
        <svg
          id="menuitem1"
          width="70"
          height="100"
          viewBox="0 0 70 100"
          fill="#767765"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M22.4478 65.0703L21.7393 69.9057L26.6989 69.2151L47.1497 49.2776L42.8982 45.1328L22.4478 65.0703Z" />
          <path d="M52.0738 44.4765C53.2459 43.3339 53.2459 41.4745 52.0736 40.3317C51.506 39.7783 50.7509 39.4735 49.9482 39.4735C49.1455 39.4735 48.3904 39.7785 47.8226 40.3319L47.1487 40.9889L51.4 45.1335L52.0738 44.4765Z" />
          <path d="M10.2194 23.6909V11.3098H0V100H70V11.3098H59.7808V23.6909H10.2194ZM56.3245 48.6205L29.5324 74.7405L22 76L13.5 77.5L15 71L16.7796 62.3077L43.5717 36.1876C45.2749 34.5271 47.5394 33.6127 49.948 33.6127C52.3565 33.6127 54.621 34.5271 56.3242 36.1874C59.8403 39.6157 59.8403 45.1928 56.3245 48.6205Z" />
          <path d="M53.7695 4.78908H42.9089C41.723 1.98146 38.8862 0 35.5834 0H34.4175C31.1149 0 28.2779 1.98146 27.092 4.78908H16.2314V17.8303H53.7695V4.78908Z" />
        </svg>
        <svg
          id="menuitem2"
          width="75"
          height="78"
          viewBox="0 0 75 78"
          fill="#767765"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M74.2594 49.2571L66.1271 42.8025C66.2812 41.5544 66.3969 40.287 66.3969 39C66.3969 37.713 66.2812 36.4456 66.1271 35.1975L74.2788 28.7429C75.011 28.1579 75.2231 27.1049 74.7413 26.247L67.0328 12.7335C66.551 11.8949 65.549 11.5439 64.6818 11.8949L55.0848 15.8144C53.0999 14.2738 50.9223 12.9675 48.5713 11.973L47.126 1.638C46.9523 0.721562 46.1623 0 45.1988 0H29.782C28.8186 0 28.0283 0.721562 27.8742 1.638L26.4289 11.973C24.0779 12.9675 21.9001 14.2545 19.9153 15.8144L10.3184 11.8949C9.45117 11.5635 8.44902 11.8949 7.96737 12.7335L0.258715 26.247C-0.223121 27.0855 -0.0110189 28.1385 0.72122 28.7429L8.85353 35.1975C8.69942 36.4456 8.5838 37.713 8.5838 39C8.5838 40.287 8.69942 41.5544 8.85353 42.8025L0.72122 49.2571C-0.0110189 49.8421 -0.223121 50.8951 0.258715 51.753L7.96719 65.2665C8.44902 66.1051 9.45099 66.4561 10.3182 66.1051L19.9152 62.1856C21.9001 63.7262 24.0777 65.0325 26.4287 66.027L27.874 76.362C28.0281 77.2784 28.8184 78 29.7819 78H45.1986C46.1621 78 46.9523 77.2784 47.1065 76.362L48.5518 66.027C50.9028 65.0325 53.0805 63.7455 55.0653 62.1856L64.6623 66.1051C65.5295 66.4365 66.5316 66.1051 67.0133 65.2665L74.7218 51.753C75.2038 50.9146 74.9917 49.8616 74.2594 49.2571ZM37.4903 52.6501C30.0325 52.6501 24.0006 46.5465 24.0006 39C24.0006 31.4535 30.0325 25.3501 37.4903 25.3501C44.9482 25.3501 50.9801 31.4537 50.9801 39.0002C50.9801 46.5467 44.9482 52.6501 37.4903 52.6501Z" />
        </svg>
      </div>

      <div className="contentContainer">
        <div className="headContent" />
        <div className="mainContent">
          {/* <button onClick={getClip}>Hello</button> */}
          <input
            type="text"
            placeholder="Your clipboard here.."
            className="textBox"
          />
        </div>
        <div className="footerContent" />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
      </Switch>
    </Router>
  );
}
