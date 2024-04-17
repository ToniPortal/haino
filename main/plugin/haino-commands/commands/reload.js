const { ipcRenderer } = require('electron');

exports.run = (command, p) => {
    p.innerText = "Redémarrage en cours...";
    ipcRenderer.send('reload-app');
};
