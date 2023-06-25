const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const request = require('request');
const pdf = require('pdf-parse');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.on('closed', function() {
    app.quit();
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow();
  }
});

// Escuchar evento 'pdfUrl' desde el proceso de renderizado
ipcMain.on('pdfUrl', (event, pdfUrl) => {
  // Descargar el PDF desde la URL proporcionada
  const downloadPath = path.join(app.getPath('downloads'), 'archivo.pdf');

  const download = (url, path) => {
    return new Promise((resolve, reject) => {
      request(url)
        .pipe(fs.createWriteStream(path))
        .on('close', resolve)
        .on('error', reject);
    });
  };

  const extractText = (filePath) => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          pdf(data)
            .then((pdfData) => {
              resolve(pdfData.text);
            })
            .catch(reject);
        }
      });
    });
  };

  download(pdfUrl, downloadPath)
    .then(() => {
      // Extraer el texto del PDF descargado
      return extractText(downloadPath);
    })
    .then((text) => {
      // Enviar el texto extraído al proceso de renderizado
      event.sender.send('pdfText', text);
    })
    .catch((error) => {
      console.error('Error al descargar o extraer el PDF:', error);
    });
});
