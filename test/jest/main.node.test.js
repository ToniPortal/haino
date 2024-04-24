jest.mock('electron', () => ({
  app: {
    whenReady: jest.fn().mockResolvedValue(),
    on: jest.fn(),
  },
  BrowserWindow: jest.fn(() => ({
    loadFile: jest.fn().mockReturnValue(),
    webContents: {
      openDevTools: jest.fn(),
    },
    show: jest.fn(),
    hide: jest.fn(),
    isVisible: jest.fn(),
  })),
  Menu: {
    setApplicationMenu: jest.fn().mockReturnValue(),
  },
  ipcMain: {
    on: jest.fn(),
  },
  globalShortcut: {
    register: jest.fn(),
    unregister: jest.fn(),
  },
  autoUpdater: {
    // Mock any methods or properties you may need
  },
  dialog: {
    // Mock any methods or properties you may need
  },
  shell: {
    // Mock any methods or properties you may need
  }
}));

const { createWindow, mainWindow } = require('../../main.js');
const { app, BrowserWindow, Menu, globalShortcut, ipcMain, autoUpdater, dialog, shell } = require('electron');

test('createWindow function should load the index.html file', () => {
  const mainWindow = createWindow();
  expect(BrowserWindow).toHaveBeenCalled(); // Vérifie que le constructeur BrowserWindow a été appelé
  expect(mainWindow.loadFile).toHaveBeenCalledWith('dist/index.html'); // Vérifie que loadFile a été appelée avec le bon chemin de fichier
});
