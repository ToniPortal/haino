const { ipcRenderer } = require('electron');

exports.run = (command, p) => {
  const string = command.trim().split(' ').slice(1).join(' ');
  const url = `http://giphy.com/search/${string}    `;
  p.innerText = url;

  ipcRenderer.send('url', `${url}`);
};
