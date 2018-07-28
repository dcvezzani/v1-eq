var express = require('express');
var router = express.Router();
import { sendShellCommand } from '../src/helpers/shell';

/* POST text message. */
router.post('/cmd', sendShellCommand);

module.exports = router;

