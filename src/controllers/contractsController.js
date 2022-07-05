const { ContractsService } = require('../services/contractsService');

class ContractsController {
    async getContract(req, res) {
        const { id: contractId } = req.params;
        const profileId = req.profile.id;
        const contractsService = new ContractsService(req.app.get('models'));
        const result = await contractsService.getContract(contractId, profileId);
        return result.error ? res.status(result.statusCode).json(result) : res.json(result);
    }

    async getActiveContractsByProfileId(req, res) {
        const contractsService = new ContractsService(req.app.get('models'));
        const profileId = req.profile.id;
        const result = await contractsService.getActiveContractsByProfileId(profileId);
        return result.error ? res.status(400).json(result) : res.json(result);
    }
}

module.exports = { ContractsController };