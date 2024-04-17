const fs = require('fs').promises;
const path = require('path');

// Charger le fichier JSON une fois
const loadData = async () => {
    try {
        const data = await fs.readFile(path.resolve(__dirname, '../main/plugin/haino-commands/commands.json'), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Erreur lors de la lecture du fichier JSON :', err);
        return [];
    }
};

var json;
const commandModules = {}; // Stocker les modules chargés
const commandsFolderPath = path.join(__dirname, '../main/plugin/haino-commands/commands');

// Charger les données JSON et les modules au démarrage
loadData().then(data => {
    json = data;
    // Précharger tous les modules
    data.forEach(commands => {
        const commandName = commands.command.split(" ")[1];
        try {
            commandModules[commandName] = {
                msg: "Module chargé avec succès.",
                module: require(path.join(commandsFolderPath, `${commandName}.js`)),
                error: null,
                primaryText: commands.primaryText
            }
        } catch (error) {
            // console.warn(`Erreur lors du chargement du module ${commandName}:`, error);
            commandModules[commandName] = {
                msg: "Erreur lors du chargement du module.",
                module: require(path.join(__dirname, '../main/plugin/error.js')),
                error: error
            };
        }
    });
});

const di = document.getElementById("info"); // Ou est afficher le putain texte du primatyText du json
const ki = document.getElementById("text"); // affichage de la commande
const touche = "Enter"; // quel touche pour lancer la commande

// Fonction pour gérer les entrées utilisateur dans l'input
async function handleInput(event) {
    let userInput = event.target.value;

    try {
        if (!json) {
            console.error('Les données JSON n\'ont pas été chargées.');
            return;
        }

        let commandName = userInput.split(" ")[1];
        if (commandModules[commandName]) {
            let moduleData = commandModules[commandName];
            console.log(moduleData.msg)
            if (moduleData.error) {
                moduleData.module.run(moduleData.error);
            } else {
                di.innerText = moduleData.primaryText
                if (event.key == touche) {
                    moduleData.module.run(userInput,ki);
                }
            }
        } else {
            di.innerText = ""
            ki.innerText = ""
        }
    } catch (err) {
        console.error('Erreur lors de la lecture du fichier JSON :', err);
    }
}

module.exports = { handleInput };
