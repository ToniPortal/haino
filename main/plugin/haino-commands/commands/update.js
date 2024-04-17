const { ipcRenderer } = require('electron');

exports.run = (command, p) => {
    p.innerText = "Update !";
    ipcRenderer.send('update-app');
};
