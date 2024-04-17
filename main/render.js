const path = require('node:path')
const { handleInput } = require("../main/commandHandler");

window.onload = function () {
    let ino = document.getElementById('commandInput');

    ino.addEventListener('keyup', (event) => { // Écouter l'événement keydown
        handleInput(event);
    });


}


