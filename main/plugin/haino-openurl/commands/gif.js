const { ipcRenderer } = require('electron');

exports.run = (command, p) => {

    let string = command.trim().split(" ").slice(1).join(" ")
    let url = `http://giphy.com/search/${string}    `
    p.innerText = url;

    ipcRenderer.send('url', `${url}`);


};
