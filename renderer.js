// Imports
const { ipcRenderer } = require('electron');

// Helpers
const dom = query => document.querySelector(query);
const addClass = (query, className) => dom(query).classList.add(className);
const removeClass = (query, className) => dom(query).classList.remove(className);
const drop = document.getElementById('drop');

// Drag and drop handlers
drop.ondragover = () => {
  addClass('body', 'drag');
  return false;
};

drop.ondragleave = () => {
  removeClass('body', 'drag');
  return false;
};

drop.ondragend = () => {
  removeClass('body', 'drag');
  return false;
};

drop.ondrop = async (e) => {
  e.preventDefault();
  removeClass('body', 'drag');

  const files = e.dataTransfer.files;

  try {
    // Show directory selection dialog
    const outputPath = await ipcRenderer.invoke('show-save-dialog');
    if (!outputPath) return false;

    addClass('body', 'loading');

    // Process each file
    const queue = Array.from(files).map(async (f) => {
      const fileName = f.name.replace(/\.[^/.]+$/, '');
      return await ipcRenderer.invoke('convert-to-webp', {
        inputPath: f.path,
        inputName: fileName,
        outputPath
      });
    });

    // Wait for all conversions to complete
    await Promise.all(queue);
    removeClass('body', 'loading');

    // Show success message
    await ipcRenderer.invoke('show-message', {
      type: 'info',
      message: `Success! ${files.length} ${
        files.length > 1 ? 'files were' : 'file was'
      } converted to WebP.`
    });
  } catch (err) {
    removeClass('body', 'loading');
    await ipcRenderer.invoke('show-error', err.message);
  }

  return false;
};
