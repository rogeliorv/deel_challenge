const { Op } = require('sequelize');

class JobsService {

    constructor({Job: jobModel, Contract: contractModel, Profile: profileModel, sequelize}) {
        this.jobModel = jobModel;
        this.contractModel = contractModel;
        this.profileModel = profileModel;
        this.sequelize = sequelize;
    }

    async getUnpaidJobs(profileId) {

        const contractsWithJobs = await this.contractModel.findAll({
            where: {
                [Op.or]: [
                    {
                        'ClientId': profileId,
                    },
                    {
                        'ContractorId': profileId,
                    },
                ],
                status: { [Op.not]: 'terminated'},
            },
            include: [
                {
                    model: this.jobModel,
                    where: {
                        'paid': {
                            [Op.not]: true
                        },
                    }
                }
            ]
        });

        const unpaidJobs = contractsWithJobs.map(contract => contract.Jobs[0]);
        return unpaidJobs;
    }

    async payJob(jobId) {

        try {
            // Use a transaction to pay
            // 1. Add to the contractor balance
            // 2. Subtract from client balance
            // 3. Mark the job as paid
            // If something fails then the entire thing is rolled back
            const transactionResult = await this.sequelize.transaction(async (transaction) => {
                const job = await this.jobModel.findOne({
                    where: {
                        id: jobId,
                    },
                    include: [
                        {
                            model: this.contractModel,
                        }
                    ]
                }, { transaction });

                if(!job) {
                    return {
                        statusCode: 404,
                        success: false,
                        error: `Job with id ${jobId} not found`,
                    };
                }

                if(job.paid) {
                    return {
                        success: true,
                        message: `Job with id ${jobId} is already paid`,
                        job,
                    };
                }

                if(job.Contract.status === 'terminated') {
                    return {
                        statusCode: 400,
                        success: false,
                        error: `Job belongs to a terminated contract`,
                    };
                }

                const contract = job.Contract;
                const clientId = contract.ClientId;
                const contractorId = contract.ContractorId;
                const jobPrice = job.price;

                const client = await this.profileModel.findOne({ where: { id: clientId }}, { transaction });
                const contractor = await this.profileModel.findOne({ where: { id: contractorId }}, { transaction });

                if(!client || !contractor) {
                    return {
                        success: false,
                        statusCode: 500,
                        error: `Something went wrong while paying for jobId ${jobId} Please contact customer support`,
                    };
                }

                if(client.balance < jobPrice) {
                    return {
                        success: false,
                        error: `Client does not have enough balance to pay for jobId ${jobId}`,
                        job: job,
                    };
                }

                client.balance -= jobPrice;
                contractor.balance += jobPrice;
                job.paid = true;
                job.paymentDate = Date.now();

                await client.save({transaction});
                await contractor.save({transaction});
                await job.save({transaction});

                return {
                    success: true,
                    job: job,
                    profile: client,
                };
            });

            if(transactionResult.error) {
                return {
                    ...transactionResult,
                    statusCode: transactionResult.statusCode || 400,
                };
            }
            return transactionResult;
        } catch(error) {
            return {
                statusCode: 400,
                success: false,
                error: `Something went wrong while paying for jobId ${jobId} Please contact customer support`,
            }
        }
    }
}

module.exports = { JobsService };
