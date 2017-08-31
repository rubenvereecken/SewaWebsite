const express = require('express');

const router = new express.Router();
module.exports = router;

router.use('/', require('./staticpages'));
router.use('/', require('./staticworkshops'));
router.use('/', require('./auth'));
router.use('/', require('./misc'))
router.use('/', require('./static')) // should be served by nginx in prod
router.use('/news', require('./news'))
router.use('/publications', require('./publications'))
router.use('/deliverables', require('./deliverables'))
router.use('/resources', require('./resources'))
router.use('/workshops', require('./workshops'))
router.use('/workshop', require('./workshops'))
