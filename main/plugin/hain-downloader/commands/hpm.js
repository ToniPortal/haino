const { ipcRenderer } = require('electron');
const { findClosestMatch } = require('../../../shared/closest');

exports.run = async (command, p, key) => {
  try {
    // Récupérer la liste des plugins depuis l'URL
    const response = await fetch('https://bddship.alwaysdata.net/list');
    if (!response.ok) {
      throw new Error('Impossible de récupérer la liste des plugins');
    }
    const data = await response.json();
    const { plugins } = data;

    // Afficher la liste des plugins
    p.innerText = `Liste des plugins disponibles :\n${plugins.join('\n')}`;

    // Si la commande contient un nom de plugin valide
    const string = command.trim().split(' ').slice(1).join(' ');

    // Télécharger le plugin spécifié
    // const downloadUrl = `https://bddship.alwaysdata.net/download/${pluginName}`;
    const therealplug = findClosestMatch(string, plugins);
    p.innerText = therealplug;

    if (key === 'Enter') {
      try {
        const send = ipcRenderer.sendSync('hpm', therealplug);
        p.innerText = send;
        // console.log('Message envoyé avec succès et réponse reçue:', send);
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message synchronisé :', error);
      }
    }
  } catch (error) {
    console.error('Une erreur est survenue :', error.message);
    p.innerText = 'Une erreur est survenue lors de la récupération des plugins.';
  }
};
