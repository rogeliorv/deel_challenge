const express = require('express');
const { getProfileMiddleware } = require('../middleware/profileMiddleware');
const { ContractsController } = require('../controllers/contractsController');

const contractsRouter = express.Router();
contractsRouter.use(getProfileMiddleware);

const contractsController = new ContractsController();

contractsRouter.get('/:id', contractsController.getContract);
contractsRouter.get('/', contractsController.getActiveContractsByProfileId);

module.exports = { contractsRouter };
