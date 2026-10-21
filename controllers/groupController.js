const { createGroupService } = require('../services/groupService');

const groupService = createGroupService();

function createGroup(request, response, next) {
  try {
    return response.status(201).json(groupService.createGroup(request.body));
  } catch (error) {
    return next(error);
  }
}

function addMember(request, response, next) {
  try {
    return response.status(201).json(
      groupService.addMember(request.params.id, request.body)
    );
  } catch (error) {
    return next(error);
  }
}

function addContribution(request, response, next) {
  try {
    return response.status(201).json(
      groupService.addContribution(request.params.id, request.body)
    );
  } catch (error) {
    return next(error);
  }
}

function getSummary(request, response, next) {
  try {
    return response.json(groupService.getSummary(request.params.id));
  } catch (error) {
    return next(error);
  }
}

module.exports = { createGroup, addMember, addContribution, getSummary };
