const jsmediatags = require('jsmediatags');

function readCover(filePath) {
  jsmediatags.read(filePath, {
    onSuccess: function(tag) {
      const tags = tag.tags;
      titleElem.textContent = tags.title || filePath.split('/').pop().replace('.mp3', '');
      authorElem.textContent = tags.artist || 'Unknown Artist';

      if (tags.picture) {
        const picture = tags.picture;
        let base64String = '';
        for (let i = 0; i < picture.data.length; i++) {
          base64String += String.fromCharCode(picture.data[i]);
        }

        const base64 = `data:${picture.format};base64,${window.btoa(base64String)}`;
        coverImg.src = base64;
      } else {
        coverImg.src = 'Images/Placeholder.jpg';
      }
    },
    onError: function(error) {
      console.error('Error reading tags:', error);
      
      const fileName = filePath.split('/').pop().replace('.mp3', '');
      titleElem.textContent = fileName;
      authorElem.textContent = 'Unknown Artist';
      coverImg.src = 'Images/Placeholder.jpg';
    }
  });
}
