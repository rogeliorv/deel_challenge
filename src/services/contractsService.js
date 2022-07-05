const { Op } = require("sequelize");

class ContractsService {

    constructor({Contract: contractModel}) {
        this.contractModel = contractModel;
    }

    async getContract(contractId, profileId) {

        const contract = await this.contractModel.findOne({
            where: {
                id: contractId,
                [Op.or]: [
                    {
                         ClientId: profileId,
                    },
                    {
                        ContractorId: profileId,
                    }
                ],
            }});

        if (!contract) {
            return {
                statusCode: 404,
                error: 'Could not find given contract'
            };
        }

        return contract;
    }

    async getActiveContractsByProfileId(profileId) {

        const userContracts = await this.contractModel.findAll({
        where: {
            [Op.or]: [
                {
                    "ClientId": profileId,
                },
                {
                    "ContractorId": profileId,
                },
            ],
            status: { [Op.not]: 'terminated'},
        }});

        return userContracts;
    }
}

module.exports = { ContractsService };
