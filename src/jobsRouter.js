const express = require('express');
const { getProfileMiddleware } = require('./middleware/profileMiddleware');
const { Op } = require("sequelize");

const jobsRouter = express.Router();
jobsRouter.use(getProfileMiddleware);

jobsRouter.get('/unpaid', async (req, res) => {

    const { Job: JobModel, Contract: ContractModel } = req.app.get('models');
    const contractsWithJobs = await ContractModel.findAll({
        where: {
            [Op.or]: [
                {
                    "ClientId": req.profile.id,
                },
                {
                    "ContractorId": req.profile.id,
                },
            ],
            status: { [Op.not]: 'terminated'},
        },
        include: [
            {
                model: JobModel,
                where: {
                    'paid': {
                        [Op.not]: true
                    },
                }
            }
        ]
    });

    const unpaidJobs = contractsWithJobs.map(contract => contract.Jobs[0]);
    res.json(unpaidJobs);
});

jobsRouter.post('/:jobId/pay', async (req, res) => {

    const { jobId } = req.params;
    const sequelize = req.app.get('sequelize');

    try {
        // Use a transaction to pay
        // 1. Add to the contractor balance
        // 2. Subtract from client balance
        // 3. Mark the job as paid
        // If something fails then the entire thing is rolled back
        const transactionResult = await sequelize.transaction(async (transaction) => {
            const { Job: JobModel, Contract: ContractModel, Profile: ProfileModel } = req.app.get('models');
            const job = await JobModel.findOne({
                where: {
                    id: jobId,
                },
                include: [
                    {
                        model: ContractModel,
                        where: {
                            status: { [Op.not]: 'terminated'},
                        },
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

            const contract = job.Contract;
            const clientId = contract.ClientId;
            const contractorId = contract.ContractorId;
            const jobPrice = job.price;

            const client = await ProfileModel.findOne({ where: { id: clientId }}, { transaction });
            const contractor = await ProfileModel.findOne({ where: { id: contractorId }}, { transaction });

            if(!client || !contractor) {
                return {
                    success: false,
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
            const statusCode = transactionResult.statusCode || 400;
            return res.status(statusCode).json(transactionResult);
        }
        return res.json(transactionResult);
    } catch(error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            error: `Something went wrong while paying for jobId ${jobId} Please contact customer support`,
        })
    }
});


module.exports = { jobsRouter };
