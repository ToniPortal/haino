/**
 * Module '../main/commandHandler' contains the 'handleInput' function responsible for processing user input.
 * @module main/commandHandler
 * @see ../main/commandHandler.js
 */
const { handleInput } = require("../main/commandHandler");

/**
 * Executes the provided function when the window is fully loaded.
 * Finds the input field element with the id 'commandInput'.
 * Adds an event listener to the input field for the 'keyup' event.
 * @function
 * @name windowOnLoad
 */
window.onload = function () {
    // Retrieve the input field element with the id 'commandInput'
    let ino = document.getElementById('commandInput');

    // Add an event listener to the input field for the 'keyup' event
    ino.addEventListener('keyup', function(event) { handleInput(event) });
};