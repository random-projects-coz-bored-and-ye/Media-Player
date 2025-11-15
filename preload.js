const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');
const jsmediatags = require('jsmediatags');

const musicDir = path.join(__dirname, '/Src/Music/'); 
// Assuming your music folder is at <project_root>/Music relative to preload.js location

contextBridge.exposeInMainWorld('api', {
  getTracks: () => {
    try {
      return fs.readdirSync(musicDir)
        .filter(file => file.endsWith('.mp3'))
        // Return absolute file paths for reliable loading
        .map(file => path.join(musicDir, file));
    } catch (e) {
      console.error('Error reading tracks:', e);
      return [];
    }
  },

  readCover: (filePath) => {
    return new Promise((resolve, reject) => {
      jsmediatags.read(filePath, {
        onSuccess: tag => resolve(tag.tags),
        onError: error => reject(error)
      });
    });
  }
});
