const fs = require('fs');
const os = require('os');
const path = require('path');
const { createJsonStore } = require('../data/store');

describe('JSON store', () => {
  let temporaryDirectory;
  let filePath;

  beforeEach(() => {
    temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'ikiminapay-store-'));
    filePath = path.join(temporaryDirectory, 'groups.json');
  });

  afterEach(() => {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  test('returns an empty group collection when the file does not exist', () => {
    expect(createJsonStore(filePath).read()).toEqual({ groups: [] });
  });

  test('persists data so a new store instance can read it', () => {
    const data = {
      groups: [{
        id: 'group-1',
        name: 'Community Fund',
        members: [{ id: 'member-1', name: 'Aline' }],
        contributions: []
      }]
    };

    createJsonStore(filePath).write(data);

    expect(createJsonStore(filePath).read()).toEqual(data);
  });
});
