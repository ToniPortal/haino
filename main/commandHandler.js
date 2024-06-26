const fs = require('fs').promises; // Module de gestion de fichiers asynchrones
const path = require('path'); // Module pour la manipulation de chemins de fichiers

const di = document.getElementById('info'); // Ou est afficher le putain texte du primatyText du json
const ki = document.getElementById('text'); // affichage de la commande
const touche = 'Enter'; // quel touche pour lancer la commande
let baseText;

/**
 * Tableau contenant les modules de commande chargés.
 * @type {Array<Object>} - Un tableau d'objets représentant les modules de commande chargés.
 */
let commandModules = [];
const allWorkingCommands = [];
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
    const defaultData = [
      { primaryText: '<infotext>', command: '/hain <nameofjsfile>' }, 
      { primaryText: '<infotexte>', command: '/hain <nameoffjsfile>' }
    ];
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
    const pluginList = files.filter((fileName) => fileName !== 'error.js');
    const json = [];

    // Chargement des données de tous les plugins en parallèle
    await Promise.all(pluginList.map(async (plugin) => {
      // Appel de la fonction loadPlugin pour chaque plugin
      const pluginData = await loadPlugin(plugin);
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
        let commandName = commands.command.split(' ')[1];
        if (!commandName) { // Si il n'y pas d'argument prendre plutot le nom de la commande pour le .js
          commandName = (commands.command).slice(1);
        }

        let commandTypes = false;
        if (commands.commandType) { // Si il a un type de commande précis
          commandTypes = true;
        }

        let key = false;
        if (commands.key) { // Si il a besoin d'appuyer sur enter a l'intérieur de la commande et non dans le commandHandler
          key = commands.key;
        }

        try {
          allWorkingCommands.push(commands.command);
          const moduleData = {
            msg: 'Module chargé avec succès.',
            module: require(path.join(commandsFolderPath, `${commandName}.js`)),
            error: null,
            command: commands.command,
            primaryText: commands.primaryText,
            commandType: commandTypes,
            key,
          };
          pluginModules.push(moduleData);
        } catch (error) {
          const moduleData = {
            msg: 'Erreur lors du chargement du module.',
            module: require(path.join(__dirname, '../main/plugin/error.js')),
            command: commands.command,
            primaryText: 'Erreur lors du chargement du module.',
            error,
          };
          pluginModules.push(moduleData);
        }
      }));

      return { name: plugin.name, plugin: pluginModules };
    });

    // Attendre la résolution de toutes les promesses de chargement des modules
    commandModules = await Promise.all(loadModulesPromises);

    console.log('commandModules', commandModules);

    baseText = `${allWorkingCommands.join('\n')}`; // Liste des commande fonctionnel

    di.innerText = '';
    ki.innerText = baseText;
  } catch (err) {
    console.error('Erreur lors de la lecture des plugins :', err);
  }
};

// Appel de la fonction pour charger les données
loadData();

/**
 * Gère les entrées utilisateur dans l'input.
 * @param {Event} event - L'événement associé à l'entrée utilisateur.
 * @returns {void}
 */
async function handleInput(event) {
  const userInput = event.target.value;

  try {
    // Si l'utilisateur appuie sur les touches fléchées haut ou bas
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      // Récupérer toutes les commandes visibles actuellement
      const visibleCommands = ki.innerText.split('\n');
      let selectedIndex = visibleCommands.indexOf(userInput);

      // Si la commande de l'utilisateur n'est pas dans les commandes visibles, sélectionner la première commande
      if (selectedIndex === -1) {
        selectedIndex = 0;
      }

      // Déplacer l'index de la commande sélectionnée en fonction de la direction de la touche
      selectedIndex += event.key === 'ArrowUp' ? -1 : 1;

      // S'assurer que l'index sélectionné reste dans les limites du tableau
      selectedIndex = Math.min(Math.max(selectedIndex, 0), visibleCommands.length - 1);

      // Sélectionner la commande correspondante
      event.target.value = visibleCommands[selectedIndex];
      return; // Arrêter le traitement de l'événement
    }

    for (const plugin of commandModules) {
      for (const moduleData of plugin.plugin) {
        if (moduleData.command.trim() === userInput.trim() && moduleData.commandType === true) {
          if (moduleData.error) {
            moduleData.module.run(moduleData.error);
          } else {
            console.log('Commands', moduleData.command.trim());

            // Afficher le texte principal du module dans di
            di.innerText = moduleData.primaryText;

            // Exécuter le module si la touche est pressée
            if (event.key === touche) {
              moduleData.module.run(userInput, ki);
            }
          }
        } else if ((moduleData.command.split(' ')[0]) === (userInput.split(' ')[0]) && moduleData.commandType === false) {
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
        } else if (event.key == 'Backspace' && event.key != 'Enter') {
          di.innerText = '';
          ki.innerText = baseText;
        }
      }
    }
  } catch (err) {
    console.error('Erreur lors de la lecture du fichier JSON :', err);
  }
}

module.exports = { handleInput, loadData };
