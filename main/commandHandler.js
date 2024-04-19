const fs = require('fs').promises; // Module de gestion de fichiers asynchrones
const path = require('path'); // Module pour la manipulation de chemins de fichiers

/**
 * Tableau contenant les modules de commande chargés.
 * @type {Array<Object>} - Un tableau d'objets représentant les modules de commande chargés.
 */
var commandModules = [];

/**
 * Charge les données d'un plugin à partir d'un fichier JSON.
 * @async
 * @param {string} plugin - Le nom du plugin à charger.
 * @returns {Promise<Object>} - Une promesse qui résout avec un objet contenant le nom du plugin et les données du plugin.
 */
async function loadPlugin(plugin) {
    // Chemin du fichier JSON contenant les données du plugin
    const filePath = path.join(__dirname, `../main/plugin/${plugin}/commands.json`);
    try {
        // Lecture du contenu du fichier JSON
        const data = await fs.readFile(filePath, 'utf8');
        // Retourne un objet avec le nom du plugin et ses données
        return { name: plugin, data: JSON.parse(data) };
    } catch (error) {
        // En cas d'erreur lors de la lecture du fichier JSON
        console.warn(`Erreur lors de la lecture du fichier JSON pour le plugin ${plugin}:`, error);
        // Données par défaut en cas d'échec de lecture du fichier JSON
        let defaultData = [{ "primaryText": "<infotext>", "command": "/hain <nameofjsfile>" }, { "primaryText": "<infotexte>", "command": "/hain <nameoffjsfile>" }];
        try {
            await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
        } catch (writeError) {
            console.error(`Erreur lors de l'écriture du fichier JSON par défaut pour le plugin ${plugin}:`, writeError);
        }
        return { name: plugin, data: defaultData };
    }
}

/**
 * Charge les données de tous les plugins disponibles.
 * @async
 * @returns {void}
 */
const loadData = async () => {
    try {
        // Récupération de la liste des fichiers dans le répertoire des plugins
        const files = await fs.readdir(path.join(__dirname, '../main/plugin'));
        // Filtre des fichiers pour exclure "error.js"
        const pluginList = files.filter(fileName => fileName !== "error.js");
        const json = [];

        // Chargement des données de tous les plugins en parallèle
        await Promise.all(pluginList.map(async (plugin) => {
            // Appel de la fonction loadPlugin pour chaque plugin
            let pluginData = await loadPlugin(plugin);
            if (pluginData) {
                json.push(pluginData);
            }
        }));

        // Traitement des données de chaque plugin
        const loadModulesPromises = json.map(async (plugin) => {
            const commandsFolderPath = path.join(__dirname, `../main/plugin/${plugin.name}/commands`);
            const pluginModules = [];

            // Chargement des modules de chaque plugin en parallèle
            await Promise.all(plugin.data.map(async (commands) => {
                var commandName = commands.command.split(" ")[1];
                if (!commandName) { // Si il n'y pas d'argument prendre plutot le nom de la commande pour le .js
                    commandName = (commands.command).slice(1);
                }

                let whatis = false
                if (plugin.name == "haino-commands") {
                    whatis = true;
                }

                let key = false;
                if (commands.key) {
                    key = true;
                }

                try {
                    const moduleData = {
                        msg: "Module chargé avec succès.",
                        module: require(path.join(commandsFolderPath, `${commandName}.js`)),
                        error: null,
                        command: commands.command,
                        primaryText: commands.primaryText,
                        what: whatis,
                        key: key
                    };
                    pluginModules.push(moduleData);
                } catch (error) {
                    const moduleData = {
                        msg: "Erreur lors du chargement du module.",
                        module: require(path.join(__dirname, '../main/plugin/error.js')),
                        command: commands.command,
                        primaryText: "Erreur lors du chargement du module.",
                        error: error
                    };
                    pluginModules.push(moduleData);
                }
            }));

            return { "name": plugin.name, "plugin": pluginModules };
        });

        // Attendre la résolution de toutes les promesses de chargement des modules
        commandModules = await Promise.all(loadModulesPromises);

        console.log("commandModules", commandModules);

    } catch (err) {
        console.error('Erreur lors de la lecture des plugins :', err);
    }
};

// Appel de la fonction pour charger les données
loadData();

const di = document.getElementById("info"); // Ou est afficher le putain texte du primatyText du json
const ki = document.getElementById("text"); // affichage de la commande
const touche = "Enter"; // quel touche pour lancer la commande

/**
 * Gère les entrées utilisateur dans l'input.
 * @param {Event} event - L'événement associé à l'entrée utilisateur.
 * @returns {void}
 */
async function handleInput(event) {
    let userInput = event.target.value;

    try {
        for (const plugin of commandModules) {
            for (const moduleData of plugin.plugin) {
                if (moduleData.command.trim() === userInput.trim() && moduleData.what == true) {
                    if (moduleData.error) {
                        moduleData.module.run(moduleData.error);
                    } else {
                        // Afficher le texte principal du module dans di
                        di.innerText = moduleData.primaryText;

                        // Exécuter le module si la touche est pressée
                        if (event.key === touche) {
                            moduleData.module.run(userInput, ki);
                        }
                    }
                } else if ((moduleData.command.split(" ")[0]) == (userInput.split(" ")[0]) && moduleData.what == false) {
                    if (moduleData.error) {
                        moduleData.module.run(moduleData.error);
                    } else {
                        // Afficher le texte principal du module dans di
                        di.innerText = moduleData.primaryText;

                        // Exécuter le module si la touche est pressée
                        if (event.key === touche && moduleData.key == false) {
                            moduleData.module.run(userInput, ki);
                        } else if (moduleData.key == true) {
                            moduleData.module.run(userInput, ki, event.key);
                        }
                    }
                } else if (event.key == "Backspace" && event.key != "Enter") {
                    di.innerText = "";
                    ki.innerText = "";
                }
            }
        }
    } catch (err) {
        console.error('Erreur lors de la lecture du fichier JSON :', err);
    }
}

module.exports = { handleInput, loadData };
