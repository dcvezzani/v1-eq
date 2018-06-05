var express = require('express');
var router = express.Router();
import { syncRoles, getRoles, getRole, createRole, updateRole, deleteRole } from '../src/helpers/roles';

/* GET users listing. */
router.get('/sync', syncRoles);
router.get('/', getRoles);
router.get('/:id', getRole);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

module.exports = router;

