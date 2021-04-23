/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, clipboard } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { communicator } from './communicator';
import * as APICalls from './Logic/APICalls';

const clipboardListener = require('clicboardhelper');
const axios = require('axios');

const ipc = ipcMain;
let currentBatch;

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    transparent: true,
    frame: false,
    titleBarStyle: 'hiddenInset',
    width: 800,
    height: 550,
    minWidth: 300,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);
  clipboardListener.startListening();
  ipc.on('closeApp', () => {
    console.log('Clickeed');
  });

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // function generator() {
  //   const ran1 = () =>
  //     [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].sort((x, z) => {
  //       const ren = Math.random();
  //       if (ren === 0.5) return 0;
  //       return ren > 0.5 ? 1 : -1;
  //     });
  //   const ran2 = () =>
  //     ran1().sort((x, z) => {
  //       const ren = Math.random();
  //       if (ren === 0.5) return 0;
  //       return ren > 0.5 ? 1 : -1;
  //     });

  //   return Array(6)
  //     .fill(null)
  //     .map((x) => ran2()[(Math.random() * 9).toFixed()])
  //     .join('');
  // }

  // const sendClip = async () => {
  //   try {
  //     currentBatch = generator();
  //     const json = { clipboard: clipboard.readText(), batch: currentBatch };
  //     console.log('Data', json);
  //     await axios
  //       .put('http://192.168.1.191:5000/Clip', json, {
  //         headers: {
  //           // Authorization: 'Basic xxxxxxxxxxxxxxxxxxx',
  //           'Content-Type': 'application/json; charset=utf-8',
  //         },
  //       })
  //       .then((res) => {
  //         return null;
  //         // Manage incoming response. If loading, then spinning wheel and loading screen. If success then success screen and timed out dismiss. If failure, then capture errors!
  //       });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const getClip = async () => {
  //   try {
  //     const response = await axios.get('http://192.168.1.53:5000/Clip/GetClip');
  //     currentBatch = response.data.batch;
  //     clipboard.writeText(response.data.clipboard);
  //     console.log('Clipboard: ', response.data.clipboard);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const getBatch = async () => {
  //   try {
  //     const response = await axios.get(
  //       'http://192.168.1.53:5000/Clip/GetBatch'
  //     );
  //     console.log('cBatch: ', currentBatch, ' nBatch: ', response.data);
  //     if (!response.data || !(response.data === currentBatch)) {
  //       await getClip();
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  setInterval(APICalls.getBatch, 500); // Loop backend to check for new clipboards

  clipboardListener.on('change', () => {
    APICalls.sendClip();
    // console.log('Hello');
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  clipboardListener.stopListening();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
