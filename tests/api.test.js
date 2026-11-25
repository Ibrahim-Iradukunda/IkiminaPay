
jest.mock('../services/groupService', () => ({
  createGroupService: jest.fn(() => ({
    createGroup: jest.fn(),
    addMember: jest.fn(),
    addContribution: jest.fn(),
    getSummary: jest.fn()
  }))
}));

jest.mock('../data/database', () => ({
  checkDatabase: jest.fn()
}));

const { createGroupService } = require('../services/groupService');
const { checkDatabase } = require('../data/database');
const app = require('../app');

describe('groups API', () => {
  let server;
  let baseUrl;
  let service;

  beforeAll(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    service = createGroupService.mock.results[0].value;
  });

  afterAll(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function post(url, body) {
    return fetch(`${baseUrl}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  test('health returns 200 when the database is up', async () => {
    checkDatabase.mockResolvedValue();

    const response = await fetch(`${baseUrl}/health`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok', database: 'up' });
    expect(checkDatabase).toHaveBeenCalledTimes(1);
  });

  test('health returns 503 when the database is down', async () => {
    const errorLogger = jest.spyOn(console, 'error').mockImplementation(() => {});
    checkDatabase.mockRejectedValue(new Error('connect ECONNREFUSED'));

    const response = await fetch(`${baseUrl}/health`);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: 'error', database: 'down' });
    expect(errorLogger).toHaveBeenCalled();
  });

  test('creates a group, adds a member, records a contribution, and reads the summary', async () => {
    service.createGroup.mockResolvedValue({
      id: 'group-1',
      name: 'Community Fund',
      members: [],
      contributions: []
    });

    service.addMember.mockResolvedValue({
      id: 'member-1',
      name: 'Aline'
    });

    service.addContribution.mockResolvedValue({
      id: 'contribution-1',
      memberId: 'member-1',
      amount: 5000,
      date: '2026-10-29T00:00:00.000Z'
    });

    service.getSummary.mockResolvedValue({
      groupId: 'group-1',
      groupName: 'Community Fund',
      members: [{ memberId: 'member-1', name: 'Aline', total: 5000 }],
      balance: 5000
    });

    const groupResponse = await post('/groups', {
      name: 'Community Fund'
    });

    expect(groupResponse.status).toBe(201);
    const group = await groupResponse.json();

    const memberResponse = await post(`/groups/${group.id}/members`, {
      name: 'Aline'
    });

    expect(memberResponse.status).toBe(201);
    const member = await memberResponse.json();

    const contributionResponse = await post(
      `/groups/${group.id}/contributions`,
      {
        memberId: member.id,
        amount: 5000,
        date: '2026-10-29'
      }
    );

    expect(contributionResponse.status).toBe(201);

    const summaryResponse = await fetch(
      `${baseUrl}/groups/${group.id}/summary`
    );

    expect(summaryResponse.status).toBe(200);
    expect(await summaryResponse.json()).toEqual({
      groupId: 'group-1',
      groupName: 'Community Fund',
      members: [{ memberId: 'member-1', name: 'Aline', total: 5000 }],
      balance: 5000
    });
  });

  test('returns validation errors for invalid contributions', async () => {
    const errorLogger = jest.spyOn(console, 'error').mockImplementation(() => {});

    service.addContribution.mockRejectedValue(
      Object.assign(new Error('Amount must be a positive number'), {
        statusCode: 400
      })
    );

    const response = await post('/groups/group-1/contributions', {
      memberId: 'member-1',
      amount: -10,
      date: '2026-10-29'
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'Amount must be a positive number'
    });

    expect(errorLogger).toHaveBeenCalled();
  });

  test('returns not found for a group that does not exist', async () => {
    const errorLogger = jest.spyOn(console, 'error').mockImplementation(() => {});

    service.getSummary.mockRejectedValue(
      Object.assign(new Error('Group not found'), {
        statusCode: 404
      })
    );

    const response = await fetch(
      `${baseUrl}/groups/missing-group/summary`
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: 'Group not found'
    });

    expect(errorLogger).toHaveBeenCalled();
  });
});
