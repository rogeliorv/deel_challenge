const express = require('express');
const { getProfileMiddleware } = require('../middleware/profileMiddleware');
const { JobsController } = require('../controllers/jobsController');

const jobsRouter = express.Router();
jobsRouter.use(getProfileMiddleware);

const jobsController = new JobsController();

jobsRouter.get('/unpaid', jobsController.getUnpaidJobs);
jobsRouter.post('/:jobId/pay', jobsController.payJob);

module.exports = { jobsRouter };
