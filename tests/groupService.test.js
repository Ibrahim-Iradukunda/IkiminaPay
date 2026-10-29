const { createGroupService, ValidationError } = require('../services/groupService');

function createMemoryStore() {
  let data = { groups: [] };

  return {
    read: () => JSON.parse(JSON.stringify(data)),
    write: (nextData) => {
      data = nextData;
    }
  };
}

describe('group service', () => {
  let service;

  beforeEach(() => {
    service = createGroupService(createMemoryStore());
  });

  test('creates a group, adds a member, records a contribution, and summarizes totals', () => {
    const group = service.createGroup({ name: 'Community Fund' });
    const member = service.addMember(group.id, { name: 'Aline' });

    service.addContribution(group.id, {
      memberId: member.id,
      amount: 5000,
      date: '2026-10-29'
    });

    expect(service.getSummary(group.id)).toEqual({
      groupId: group.id,
      groupName: 'Community Fund',
      members: [{ memberId: member.id, name: 'Aline', total: 5000 }],
      balance: 5000
    });
  });

  test('trims group and member names', () => {
    const group = service.createGroup({ name: '  Community Fund  ' });
    const member = service.addMember(group.id, { name: '  Aline  ' });

    expect(group.name).toBe('Community Fund');
    expect(member.name).toBe('Aline');
  });

  test('rejects invalid names, amounts, dates, and members', () => {
    const group = service.createGroup({ name: 'Community Fund' });
    const otherGroup = service.createGroup({ name: 'Other Fund' });
    const member = service.addMember(group.id, { name: 'Aline' });

    expect(() => service.createGroup({ name: '   ' })).toThrow(ValidationError);
    expect(() => service.addMember(group.id, { name: '' })).toThrow(ValidationError);
    expect(() => service.addMember('missing-group', { name: 'Aline' })).toThrow(
      'Group not found'
    );
    expect(() => service.addContribution(group.id, {
      memberId: member.id,
      amount: -1,
      date: '2026-10-29'
    })).toThrow('Amount must be a non-negative number');
    expect(() => service.addContribution(group.id, {
      memberId: member.id,
      amount: 100,
      date: 'not-a-date'
    })).toThrow('Date must be a valid date');
    expect(() => service.addContribution(otherGroup.id, {
      memberId: member.id,
      amount: 100,
      date: '2026-10-29'
    })).toThrow('Member not found in this group');
  });
});
