const { ipcRenderer } = require('electron');

exports.run = (command, p) => {
  const string = command.trim().split(' ').slice(1).join(' ');
  const url = `http://www.bing.com/images/search?q=${string}`;
  p.innerText = url;

  ipcRenderer.send('url', `${url}`);
};
