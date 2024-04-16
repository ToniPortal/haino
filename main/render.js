const fs = require('fs');

window.onload = function () {

    const inputElement = document.getElementById('commandInput'); // Remplace 'input' par l'ID de ton input
    inputElement.addEventListener('input', handleInput);

    // Fonction pour gérer les entrées utilisateur dans l'input
    function handleInput(event) {
        const userInput = event.target.value; 

        fs.readFile('./main/plugin/haino-command/command.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Erreur lors de la lecture du fichier JSON :', err);
                return;
            }

            // Convertir les données JSON en objet JavaScript
            const json = JSON.parse(data);
            // Comparer l'entrée utilisateur aux commandes du fichier JSON
            json.forEach(commands => {
                if (userInput === commands.command) {
                    // Si l'entrée utilisateur correspond à une commande du JSON, déclencher une action
                    // Par exemple, afficher un message ou exécuter une fonction associée à cette commande
                    console.log(`L'utilisateur a saisi la commande : ${userInput}`);
                    console.log(userInput.split(" "))
                }
            });
        });

    }

}


