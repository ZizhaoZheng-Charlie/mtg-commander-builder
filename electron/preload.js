import { contextBridge, ipcRenderer } from 'electron';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateMessage: callback =>
    ipcRenderer.on('main-process-message', (_event, value) => callback(value)),

  // File system APIs
  fs: {
    getUserDataPath: () => ipcRenderer.invoke('fs:getUserDataPath'),
    writeFile: (filePath, data) =>
      ipcRenderer.invoke('fs:writeFile', filePath, data),
    readFile: filePath => ipcRenderer.invoke('fs:readFile', filePath),
    deleteFile: filePath => ipcRenderer.invoke('fs:deleteFile', filePath),
    fileExists: filePath => ipcRenderer.invoke('fs:fileExists', filePath),
    readDir: dirPath => ipcRenderer.invoke('fs:readDir', dirPath),
    ensureDir: dirPath => ipcRenderer.invoke('fs:ensureDir', dirPath),
  },
});
