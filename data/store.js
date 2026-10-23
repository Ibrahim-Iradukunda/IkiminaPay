const fs = require('fs');
const path = require('path');

function createJsonStore(filePath = path.join(__dirname, 'groups.json')) {
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
