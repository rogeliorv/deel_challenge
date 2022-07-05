const { JobsService } = require("../services/jobsService");

class JobsController {

    async getUnpaidJobs(req, res) {
        const profileId = req.profile.id;
        const jobsService = new JobsService(req.app.get('models'));
        const result = await jobsService.getUnpaidJobs(profileId);
        return result.statusCode ? res.status(result.statusCode).json(result) : res.json(result);
    }

    async payJob(req, res) {
        const { jobId } = req.params;
        const sequelize = req.app.get('sequelize');
        const jobsService = new JobsService({...req.app.get('models'), sequelize});
        const result = await jobsService.payJob(jobId);
        return result.statusCode ? res.status(result.statusCode).json(result) : res.json(result);
    }
}

module.exports = { JobsController };