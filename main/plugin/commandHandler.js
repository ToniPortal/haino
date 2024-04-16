const fs = require('fs');

// Chemin vers ton fichier JSON
const commandsFilePath = './main/plugin/haino-command/command.js';

// Lire le fichier JSON
fs.readFile(commandsFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Erreur lors de la lecture du fichier JSON :', err);
    return;
  }
  
  // Convertir les données JSON en objet JavaScript
  const json = JSON.parse(data);
  
  // Faire quelque chose avec les commandes récupérées
  console.log(json);
});
