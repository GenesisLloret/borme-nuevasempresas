const { contextBridge, ipcRenderer } = require('electron');

// Permitir la comunicación entre el proceso de renderizado y el proceso principal
contextBridge.exposeInMainWorld('electron', {
  sendPDFUrl: (url) => {
    ipcRenderer.send('pdfUrl', url);
  },
  receivePDFText: (callback) => {
    ipcRenderer.on('pdfText', (event, text) => {
      callback(text);
    });
  }
});