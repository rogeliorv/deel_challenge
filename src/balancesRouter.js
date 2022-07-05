const express = require('express');
const { getProfileMiddleware } = require('./middleware/profileMiddleware');
const { Op } = require("sequelize");

const balancesRouter = express.Router();
balancesRouter.use(getProfileMiddleware);

const JOBS_DEPOSIT_LIMIT_PERCENT = 0.25;

const getBalanceDepositLimit = (jobs) => {
    const totalInJobs = jobs.map(job => job.price).reduce(((acc,price) => acc + price), 0);
    return totalInJobs * JOBS_DEPOSIT_LIMIT_PERCENT;
};

balancesRouter.post('/deposit/:userId', async (req, res) => {

    const { Job: JobModel, Contract: ContractModel, Profile: ProfileModel } = req.app.get('models');
    const { userId } = req.params;

    const profile = await ProfileModel.findOne({ where: { id: userId }});

    if(!profile) {
        return res.status(404).json({
            success: false,
            error: `Could not find userId ${userId}`,
        });
    }

    const depositAmountStr = req.body.depositAmount;

    if (!depositAmountStr) {
        return res.status(400).json({
            success: false,
            error: `You need to specify the depositAmount`,
        });
    }

    const depositAmount = parseInt(depositAmountStr, 10);
    if(!depositAmount) {
        return res.status(400).json({
            success: false,
            error: `DepositAmount must be a positive integer`,
        });
    }

    if(depositAmount < 0) {
        return res.status(400).json({success: false, error: `Deposit amount must be a positive amount`});
    }

    const jobs = await JobModel.findAll({
        where: {
            paid: {
                [Op.not]: true
            },
        },
        include: [
            {
                model: ContractModel,
                where: {
                    status: { [Op.not]: 'terminated'},
                },
                include: [
                    {
                        model: ProfileModel,
                        as: 'Client',
                        where: {
                            id: userId
                        }
                    }
                ]
            },
        ]
    });

    console.log("QUERIED JOBS");
    console.log(jobs);
    if(!jobs || jobs.length === 0) {
        return res.status(400).json({
            success: false,
            error: `There are no jobs to pay. You need at least one unpaid job within an unterminated contract `,
        })
    }

    const balanceLimit = getBalanceDepositLimit(jobs);
    if(depositAmount > balanceLimit) {
        return res.status(400).json({
            success: false,
            error: `Cannot deposit more than 25% of the total pending jobs to pay. Current limit is ${balanceLimit}`,
        })
    }


    // Default to 0 in case its not initially set in the DB
    const currentBalance = profile.balance || 0;
    const newBalance = currentBalance + depositAmount;
    profile.balance = newBalance;
    await profile.save();

    return res.json({
        success: true,
        oldBalance: currentBalance,
        newBalance: newBalance,
        profile: profile,
    });
});

module.exports = { balancesRouter };
