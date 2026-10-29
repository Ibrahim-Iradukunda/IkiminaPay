jest.mock('../data/store', () => {
  const mockData = { groups: [] };

  return {
    mockData,
    createJsonStore: jest.fn(() => ({
      read: () => JSON.parse(JSON.stringify(mockData)),
      write: (data) => {
        mockData.groups = data.groups;
      }
    }))
  };
});

const { mockData } = require('../data/store');
const app = require('../app');

describe('groups API', () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterAll(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  });

  beforeEach(() => {
    mockData.groups = [];
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  async function post(url, body) {
    return fetch(`${baseUrl}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  test('creates a group, adds a member, records a contribution, and reads back the summary', async () => {
    const groupResponse = await post('/groups', { name: 'Community Fund' });
    expect(groupResponse.status).toBe(201);
    const group = await groupResponse.json();

    const memberResponse = await post(`/groups/${group.id}/members`, { name: 'Aline' });
    expect(memberResponse.status).toBe(201);
    const member = await memberResponse.json();

    const contributionResponse = await post(`/groups/${group.id}/contributions`, {
      memberId: member.id,
      amount: 5000,
      date: '2026-10-29'
    });
    expect(contributionResponse.status).toBe(201);

    const summaryResponse = await fetch(`${baseUrl}/groups/${group.id}/summary`);
    expect(summaryResponse.status).toBe(200);
    expect(await summaryResponse.json()).toEqual({
      groupId: group.id,
      groupName: 'Community Fund',
      members: [{ memberId: member.id, name: 'Aline', total: 5000 }],
      balance: 5000
    });
  });

  test('returns validation errors without recording an invalid contribution', async () => {
    const errorLogger = jest.spyOn(console, 'error').mockImplementation(() => {});
    const groupResponse = await post('/groups', { name: 'Community Fund' });
    const group = await groupResponse.json();
    const memberResponse = await post(`/groups/${group.id}/members`, { name: 'Aline' });
    const member = await memberResponse.json();

    const invalidContribution = await post(`/groups/${group.id}/contributions`, {
      memberId: member.id,
      amount: -10,
      date: '2026-10-29'
    });
    expect(invalidContribution.status).toBe(400);
    expect(await invalidContribution.json()).toEqual({
      error: 'Amount must be a non-negative number'
    });

    const summaryResponse = await fetch(`${baseUrl}/groups/${group.id}/summary`);
    expect((await summaryResponse.json()).balance).toBe(0);
    expect(errorLogger).toHaveBeenCalled();
  });

  test('returns not found for a group that does not exist', async () => {
    const errorLogger = jest.spyOn(console, 'error').mockImplementation(() => {});
    const response = await fetch(`${baseUrl}/groups/missing-group/summary`);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Group not found' });
    expect(errorLogger).toHaveBeenCalled();
  });
});
