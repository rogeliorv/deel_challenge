const express = require('express');
const { getProfileMiddleware } = require('../middleware/profileMiddleware');
const { AdminController } = require('../controllers/adminController');

const adminRouter = express.Router();
const adminController = new AdminController();

adminRouter.use(getProfileMiddleware);
adminRouter.get('/best-profession', adminController.getBestProfessionInDateRange);
adminRouter.get('/best-clients', adminController.getBestClientsInDateRange);

module.exports = { adminRouter };
