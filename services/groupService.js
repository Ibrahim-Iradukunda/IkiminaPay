
const crypto = require('crypto');
const { pool } = require('../data/database');

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

function createGroupService(db = pool) {
  async function createGroup({ name } = {}) {
    const groupName = requireText(name, 'Group name');
    const id = crypto.randomUUID();

    const result = await db.query(
      `INSERT INTO groups (id, name)
       VALUES ($1, $2)
       RETURNING id, name`,
      [id, groupName]
    );

    const group = result.rows[0];

    return {
      id: group.id,
      name: group.name,
      members: [],
      contributions: []
    };
  }

  async function addMember(groupId, { name } = {}) {
    const memberName = requireText(name, 'Member name');
    const id = crypto.randomUUID();

    const result = await db.query(
      `INSERT INTO members (id, group_id, name)
       SELECT $1, id, $3
       FROM groups
       WHERE id = $2
       RETURNING id, name`,
      [id, groupId, memberName]
    );

    if (result.rowCount === 0) {
      throw new ValidationError('Group not found', 404);
    }

    return result.rows[0];
  }

  async function addContribution(groupId, { memberId, amount, date } = {}) {
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      throw new ValidationError('Amount must be a positive number');
    }

    const parsedDate = new Date(date);

    if (!date || Number.isNaN(parsedDate.getTime())) {
      throw new ValidationError('Date must be a valid date');
    }

    const groupResult = await db.query(
      'SELECT id FROM groups WHERE id = $1',
      [groupId]
    );

    if (groupResult.rowCount === 0) {
      throw new ValidationError('Group not found', 404);
    }

    const memberResult = await db.query(
      'SELECT id FROM members WHERE id = $1 AND group_id = $2',
      [memberId, groupId]
    );

    if (memberResult.rowCount === 0) {
      throw new ValidationError('Member not found in this group', 404);
    }

    const id = crypto.randomUUID();
    const contributionDate = parsedDate.toISOString().slice(0, 10);

    const result = await db.query(
      `INSERT INTO contributions
         (id, group_id, member_id, amount, contribution_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, member_id, amount, contribution_date`,
      [id, groupId, memberId, amount, contributionDate]
    );

    const contribution = result.rows[0];

    return {
      id: contribution.id,
      memberId: contribution.member_id,
      amount: Number(contribution.amount),
      date: new Date(`${contribution.contribution_date}T00:00:00.000Z`).toISOString()
    };
  }

  async function getSummary(groupId) {
    const result = await db.query(
      `SELECT
         g.id AS group_id,
         g.name AS group_name,
         m.id AS member_id,
         m.name AS member_name,
         COALESCE(SUM(c.amount), 0) AS total
       FROM groups g
       LEFT JOIN members m
         ON m.group_id = g.id
       LEFT JOIN contributions c
         ON c.member_id = m.id
        AND c.group_id = g.id
       WHERE g.id = $1
       GROUP BY g.id, g.name, m.id, m.name, m.created_at
       ORDER BY m.created_at`,
      [groupId]
    );

    if (result.rowCount === 0) {
      throw new ValidationError('Group not found', 404);
    }

    const members = result.rows
      .filter((row) => row.member_id !== null)
      .map((row) => ({
        memberId: row.member_id,
        name: row.member_name,
        total: Number(row.total)
      }));

    return {
      groupId: result.rows[0].group_id,
      groupName: result.rows[0].group_name,
      members,
      balance: members.reduce((sum, member) => sum + member.total, 0)
    };
  }

  return {
    createGroup,
    addMember,
    addContribution,
    getSummary
  };
}

module.exports = { createGroupService, ValidationError };

