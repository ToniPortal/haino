// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, globalShortcut } = require('electron')
const path = require('node:path')

// Hot Reload
const electronReload = require('@millyc/electron-reload');
electronReload(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  hardResetMethod: 'exit',
});



function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 544,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js')
      contextIsolation: false,
      nodeIntegration: true

    },
    frame: false,
  })
  Menu.setApplicationMenu(null)
  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadFile('dist/index.html') // and load the index.html of the app.

  mainWindow.webContents.openDevTools()

  // Créer le raccourci clavier Alt+Enter pour afficher l'application.
  globalShortcut.register('Alt+Space', () => {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    } else {
      mainWindow.hide();
    }
  });

  globalShortcut.register('Escape', () => {
    if (mainWindow.isVisible()) {
      app.quit();
    }
  });

}



// This method will be called when Electron has finished initialization and is ready to create browser windows. Some APIs can only be used after this event occurs. 
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () { // Sur macOS, il est courant de recréer une fenêtre dans l'application lorsque
    if (BrowserWindow.getAllWindows().length === 0) createWindow();// l'icône du dock est cliquée et qu'il n'y a pas d'autres fenêtres ouvertes.
  });


})

app.on('will-quit', () => {
  // Unregister a shortcut.
  globalShortcut.unregister('Alt+Space')
  globalShortcut.unregister('Escape');

  // Unregister all shortcuts.
  // globalShortcut.unregisterAll()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
