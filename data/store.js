const fs = require('fs');
const path = require('path');

// DATA_FILE lets Docker keep data in a volume outside the code folder.
function createJsonStore(filePath = process.env.DATA_FILE || path.join(__dirname, 'groups.json')) {
  return {
    read() {
      try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        return { groups: [] };
      }
    },
    write(data) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      const temporaryPath = `${filePath}.tmp`;
      fs.writeFileSync(temporaryPath, JSON.stringify(data, null, 2));
      fs.renameSync(temporaryPath, filePath);
    }
  };
}

module.exports = { createJsonStore };
