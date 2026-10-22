const { createGroupService, ValidationError } = require('./groupService');

function createMemoryStore() {
  let data = { groups: [] };
  return {
    read: jest.fn(() => data),
    write: jest.fn((nextData) => {
      data = nextData;
    })
  };
}

describe('group service', () => {
  let store;
  let service;

  beforeEach(() => {
    store = createMemoryStore();
    service = createGroupService(store);
  });

  test('creates a group with a trimmed name and empty records', () => {
    const group = service.createGroup({ name: '  Umucyo Circle  ' });

    expect(group).toEqual({
      id: expect.any(String),
      name: 'Umucyo Circle',
      members: [],
      contributions: []
    });
    expect(store.write).toHaveBeenCalledTimes(1);
  });

  test('rejects a blank group name', () => {
    expect(() => service.createGroup({ name: '  ' })).toThrow(
      new ValidationError('Group name is required')
    );
    expect(store.write).not.toHaveBeenCalled();
  });

  test('adds a member to an existing group with a trimmed name', () => {
    const group = service.createGroup({ name: 'Community Circle' });

    const member = service.addMember(group.id, { name: '  Aline  ' });

    expect(member).toEqual({ id: expect.any(String), name: 'Aline' });
    expect(service.getSummary(group.id).members).toEqual([
      { memberId: member.id, name: 'Aline', total: 0 }
    ]);
  });

  test('records valid contributions and calculates member totals and group balance', () => {
    const group = service.createGroup({ name: 'Community Circle' });
    const member = service.addMember(group.id, { name: 'Aline' });

    const contribution = service.addContribution(group.id, {
      memberId: member.id,
      amount: 5000,
      date: '2026-10-22'
    });

    expect(contribution).toEqual({
      id: expect.any(String),
      memberId: member.id,
      amount: 5000,
      date: '2026-10-22T00:00:00.000Z'
    });
    expect(service.getSummary(group.id)).toEqual({
      groupId: group.id,
      groupName: 'Community Circle',
      members: [{ memberId: member.id, name: 'Aline', total: 5000 }],
      balance: 5000
    });
  });

  test.each([
    ['negative amount', -1],
    ['non-numeric amount', '5000'],
    ['infinite amount', Infinity]
  ])('rejects invalid amount (%s)', (description, amount) => {
    const group = service.createGroup({ name: 'Community Circle' });
    const member = service.addMember(group.id, { name: 'Aline' });
    store.write.mockClear();

    expect(() =>
      service.addContribution(group.id, {
        memberId: member.id,
        amount,
        date: '2026-10-22'
      })
    ).toThrow(new ValidationError('Amount must be a non-negative number'));
    expect(store.write).not.toHaveBeenCalled();
  });

  test('rejects invalid contribution dates and members not in the group', () => {
    const group = service.createGroup({ name: 'Community Circle' });
    const member = service.addMember(group.id, { name: 'Aline' });

    expect(() =>
      service.addContribution(group.id, {
        memberId: member.id,
        amount: 5000,
        date: 'not-a-date'
      })
    ).toThrow(new ValidationError('Date must be a valid date'));
    expect(() =>
      service.addContribution(group.id, {
        memberId: 'unknown-member',
        amount: 5000,
        date: '2026-10-22'
      })
    ).toThrow(new ValidationError('Member not found in this group', 404));
  });

  test('returns not found errors for unknown groups', () => {
    expect(() => service.addMember('unknown-group', { name: 'Aline' })).toThrow(
      new ValidationError('Group not found', 404)
    );
    expect(() => service.getSummary('unknown-group')).toThrow(
      new ValidationError('Group not found', 404)
    );
  });
});
