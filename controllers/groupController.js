
const { createGroupService } = require('../services/groupService');

const groupService = createGroupService();

async function createGroup(request, response, next) {
  try {
    const group = await groupService.createGroup(request.body);
    return response.status(201).json(group);
  } catch (error) {
    return next(error);
  }
}

async function addMember(request, response, next) {
  try {
    const member = await groupService.addMember(
      request.params.id,
      request.body
    );

    return response.status(201).json(member);
  } catch (error) {
    return next(error);
  }
}

async function addContribution(request, response, next) {
  try {
    const contribution = await groupService.addContribution(
      request.params.id,
      request.body
    );

    return response.status(201).json(contribution);
  } catch (error) {
    return next(error);
  }
}

async function getSummary(request, response, next) {
  try {
    const summary = await groupService.getSummary(request.params.id);
    return response.json(summary);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createGroup,
  addMember,
  addContribution,
  getSummary
};

