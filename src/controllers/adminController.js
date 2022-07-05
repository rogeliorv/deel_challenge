const { AdminService } = require("../services/adminService");

class AdminController {

    async getBestProfessionInDateRange(req, res) {
        const adminService = new AdminService(req.app.get('models'));
        const result = await adminService.getBestProfessionInDateRange(req.query.start, req.query.end);
        return result.error ? res.status(400).json(result) : res.json(result);
    }

    async getBestClientsInDateRange(req, res) {
        const adminService = new AdminService(req.app.get('models'));
        const result = await adminService.getBestClientsInDateRange(req.query.start, req.query.end, req.query.limit);
        return result.error ? res.status(400).json(result) : res.json(result);
    }
}

module.exports = { AdminController };
