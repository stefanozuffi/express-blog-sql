const express = require('express')
const router = express.Router()

const tagController = require('../controllers/tagController.js')

router.post('/', tagController.store)

module.exports = router;