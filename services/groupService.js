const crypto = require('crypto');
const { createJsonStore } = require('../data/store');

class ValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function requireText(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ValidationError(`${field} is required`);
  }

  return value.trim();
}

function createGroupService(store = createJsonStore()) {
  function findGroup(data, groupId) {
    const group = data.groups.find((item) => item.id === groupId);
    if (!group) {
      throw new ValidationError('Group not found', 404);
    }
    return group;
  }

  function createGroup({ name }) {
    const data = store.read();
    const group = {
      id: crypto.randomUUID(),
      name: requireText(name, 'Group name'),
      members: [],
      contributions: []
    };
    data.groups.push(group);
    store.write(data);
    return group;
  }

  function addMember(groupId, { name }) {
    const data = store.read();
    const group = findGroup(data, groupId);
    const member = { id: crypto.randomUUID(), name: requireText(name, 'Member name') };
    group.members.push(member);
    store.write(data);
    return member;
  }

  function addContribution(groupId, { memberId, amount, date }) {
    const data = store.read();
    const group = findGroup(data, groupId);
    if (!group.members.some((member) => member.id === memberId)) {
      throw new ValidationError('Member not found in this group', 404);
    }
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
      throw new ValidationError('Amount must be a non-negative number');
    }
    const parsedDate = new Date(date);
    if (!date || Number.isNaN(parsedDate.getTime())) {
      throw new ValidationError('Date must be a valid date');
    }

    const contribution = {
      id: crypto.randomUUID(),
      memberId,
      amount,
      date: parsedDate.toISOString()
    };
    group.contributions.push(contribution);
    store.write(data);
    return contribution;
  }

  function getSummary(groupId) {
    const data = store.read();
    const group = findGroup(data, groupId);
    const totals = group.members.map((member) => ({
      memberId: member.id,
      name: member.name,
      total: group.contributions
        .filter((contribution) => contribution.memberId === member.id)
        .reduce((sum, contribution) => sum + contribution.amount, 0)
    }));

    return {
      groupId: group.id,
      groupName: group.name,
      members: totals,
      balance: totals.reduce((sum, member) => sum + member.total, 0)
    };
  }

  return { createGroup, addMember, addContribution, getSummary };
}

module.exports = { createGroupService, ValidationError };
