const express = require('express');
const { screenCandidates } = require('../controllers/candidatesController');

const router = express.Router();

router.post('/screen', screenCandidates);

module.exports = router;
