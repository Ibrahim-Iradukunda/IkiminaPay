
jest.mock('../data/database', () => ({
  pool: { query: jest.fn() }
}));

const { pool } = require('../data/database');
const { createGroupService, ValidationError } = require('../services/groupService');

describe('PostgreSQL group service', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = createGroupService(pool);
  });

  test('creates a group', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 'group-1', name: 'Community Fund' }],
      rowCount: 1
    });

    const group = await service.createGroup({ name: 'Community Fund' });

    expect(group).toEqual({
      id: 'group-1',
      name: 'Community Fund',
      members: [],
      contributions: []
    });

    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  test('trims group and member names', async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ id: 'group-1', name: 'Community Fund' }],
        rowCount: 1
      })
      .mockResolvedValueOnce({
        rows: [{ id: 'member-1', name: 'Aline' }],
        rowCount: 1
      });

    const group = await service.createGroup({
      name: '  Community Fund  '
    });

    const member = await service.addMember(group.id, {
      name: '  Aline  '
    });

    expect(group.name).toBe('Community Fund');
    expect(member.name).toBe('Aline');
  });

  test('adds a member to an existing group', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 'member-1', name: 'Aline' }],
      rowCount: 1
    });

    const member = await service.addMember('group-1', {
      name: 'Aline'
    });

    expect(member).toEqual({
      id: 'member-1',
      name: 'Aline'
    });
  });

  test('records a contribution', async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ id: 'group-1' }],
        rowCount: 1
      })
      .mockResolvedValueOnce({
        rows: [{ id: 'member-1' }],
        rowCount: 1
      })
      .mockResolvedValueOnce({
        rows: [{
          id: 'contribution-1',
          member_id: 'member-1',
          amount: '5000.00',
          contribution_date: '2026-10-29'
        }],
        rowCount: 1
      });

    const contribution = await service.addContribution('group-1', {
      memberId: 'member-1',
      amount: 5000,
      date: '2026-10-29'
    });

    expect(contribution).toEqual({
      id: 'contribution-1',
      memberId: 'member-1',
      amount: 5000,
      date: '2026-10-29T00:00:00.000Z'
    });
  });

  test('returns the group summary', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          group_id: 'group-1',
          group_name: 'Community Fund',
          member_id: 'member-1',
          member_name: 'Aline',
          total: '5000.00'
        }
      ],
      rowCount: 1
    });

    const summary = await service.getSummary('group-1');

    expect(summary).toEqual({
      groupId: 'group-1',
      groupName: 'Community Fund',
      members: [{
        memberId: 'member-1',
        name: 'Aline',
        total: 5000
      }],
      balance: 5000
    });
  });

  test('rejects invalid group and member names', async () => {
    await expect(
      service.createGroup({ name: '   ' })
    ).rejects.toThrow(ValidationError);

    await expect(
      service.addMember('group-1', { name: '' })
    ).rejects.toThrow(ValidationError);

    expect(pool.query).not.toHaveBeenCalled();
  });

  test('rejects a missing group when adding a member', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [],
      rowCount: 0
    });

    await expect(
      service.addMember('missing-group', { name: 'Aline' })
    ).rejects.toThrow('Group not found');
  });

  test('rejects invalid contribution amounts and dates', async () => {
    await expect(
      service.addContribution('group-1', {
        memberId: 'member-1',
        amount: -10,
        date: '2026-10-29'
      })
    ).rejects.toThrow('Amount must be a positive number');

    await expect(
      service.addContribution('group-1', {
        memberId: 'member-1',
        amount: 100,
        date: 'not-a-date'
      })
    ).rejects.toThrow('Date must be a valid date');

    expect(pool.query).not.toHaveBeenCalled();
  });

  test('rejects a member who does not belong to the group', async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ id: 'group-1' }],
        rowCount: 1
      })
      .mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

    await expect(
      service.addContribution('group-1', {
        memberId: 'other-member',
        amount: 100,
        date: '2026-10-29'
      })
    ).rejects.toThrow('Member not found in this group');
  });

  test('rejects a missing group when reading its summary', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [],
      rowCount: 0
    });

    await expect(
      service.getSummary('missing-group')
    ).rejects.toThrow('Group not found');
  });
});
