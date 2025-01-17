// const { ipcRenderer } = require('electron');

// const ipc = ipcRenderer;

// closeBtn.addEventListener('click', () => {
//   ipc.send('closeApp');
// });

export const communicator = (ipcMain) => {
  ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg);
    event.sender.send('asynchronous-reply', 'pong');
  });
};

export const transponder = (ipcRenderer) => {
  ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log(arg);
  });
  ipcRenderer.send('asynchronous-message', 'ping');
};
