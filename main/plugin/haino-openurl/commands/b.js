const { ipcRenderer } = require('electron');

exports.run = (command, p) => {

    let string = command.trim().split(" ").slice(1).join(" ")
    let url = `http://www.bing.com/search?q=${string}`
    p.innerText = url;

    ipcRenderer.send('url', `${url}`);


};
