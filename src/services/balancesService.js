const { Op } = require('sequelize');

class BalancesService {

    JOBS_DEPOSIT_LIMIT_PERCENT = 0.25;

    constructor({Job: jobModel, Contract: contractModel, Profile: profileModel}) {
        this.jobModel = jobModel;
        this.contractModel = contractModel;
        this.profileModel = profileModel;
    }

    getBalanceDepositLimit(jobs) {
        const totalInJobs = jobs.map(job => job.price).reduce(((acc,price) => acc + price), 0);
        return totalInJobs * this.JOBS_DEPOSIT_LIMIT_PERCENT;
    }

    async deposit(userId, depositAmountStr) {

        const profile = await this.profileModel.findOne({ where: { id: userId }});

        if(!profile) {
            return {
                success: false,
                statusCode: 404,
                error: `Could not find userId ${userId}`,
            };
        }

        if (!depositAmountStr) {
            return {
                success: false,
                statusCode: 400,
                error: `You need to specify the depositAmount`,
            };
        }

        const depositAmount = parseInt(depositAmountStr, 10);
        if(!depositAmount) {
            return {
                success: false,
                statusCode: 400,
                error: `DepositAmount must be a positive integer`,
            };
        }

        if(depositAmount < 0) {
            return {
                statusCode: 400,
                success: false,
                error: `Deposit amount must be a positive amount`,
            };
        }

        const jobs = await this.jobModel.findAll({
            where: {
                paid: {
                    [Op.not]: true
                },
            },
            include: [
                {
                    model: this.contractModel,
                    where: {
                        status: { [Op.not]: 'terminated'},
                    },
                    include: [
                        {
                            model: this.profileModel,
                            as: 'Client',
                            where: {
                                id: userId
                            }
                        }
                    ]
                },
            ]
        });

        if(!jobs || jobs.length === 0) {
            return {
                statusCode: 400,
                success: false,
                error: `There are no jobs to pay. You need at least one unpaid job within an unterminated contract `,
            };
        }

        const balanceLimit = this.getBalanceDepositLimit(jobs);

        if(depositAmount > balanceLimit) {
            return {
                statusCode: 400,
                success: false,
                error: `Cannot deposit more than 25% of the total pending jobs to pay. Current limit is ${balanceLimit}`,
            };
        }

        // Default to 0 in case its not initially set in the DB
        const currentBalance = profile.balance || 0;
        const newBalance = currentBalance + depositAmount;
        profile.balance = newBalance;
        await profile.save();

        return {
            success: true,
            oldBalance: currentBalance,
            newBalance: newBalance,
            profile: profile,
        };
    }
}

module.exports = { BalancesService };
