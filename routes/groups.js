const express = require('express');
const controller = require('../controllers/groupController');

const router = express.Router();

router.post('/', controller.createGroup);
router.post('/:id/members', controller.addMember);
router.post('/:id/contributions', controller.addContribution);
router.get('/:id/summary', controller.getSummary);

module.exports = router;
