const express = require('express');
const { getProfileMiddleware } = require('../middleware/profileMiddleware');
const { BalancesController } = require('../controllers/balancesController');

const balancesRouter = express.Router();
balancesRouter.use(getProfileMiddleware);

const balancesController = new BalancesController();
balancesRouter.post('/deposit/:userId', balancesController.deposit);


module.exports = { balancesRouter };
