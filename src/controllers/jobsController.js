const { JobsService } = require("../services/jobsService");

class JobsController {

    async getUnpaidJobs(req, res) {

        const profileId = req.profile.id;
        const jobsService = new JobsService(req.app.get('models'));
        const result = await jobsService.getUnpaidJobs(profileId);
        return result.error ? res.status(400).json(result) : res.json(result);
    }

    async payJob(req, res) {
        const { jobId } = req.params;
        const sequelize = req.app.get('sequelize');
        const jobsService = new JobsService({...req.app.get('models'), sequelize});
        const result = await jobsService.payJob(jobId);
        return result.error ? res.status(400).json(result) : res.json(result);
    }
}

module.exports = { JobsController };