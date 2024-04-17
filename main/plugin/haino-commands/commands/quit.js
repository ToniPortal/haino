const { ipcRenderer } = require('electron');

exports.run = (command, p) => {
    p.innerText = "Quitter..";
    ipcRenderer.send('quit-app');
};
