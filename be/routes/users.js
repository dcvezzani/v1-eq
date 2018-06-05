var express = require('express');
var router = express.Router();
import { syncMembershipRecords, indexMembers, getMember, updateMember } from '../src/helpers/users';

/* GET users listing. */
router.get('/sync', syncMembershipRecords);
router.get('/', indexMembers);
router.get('/:id', getMember);
router.put('/:id', updateMember);

module.exports = router;

