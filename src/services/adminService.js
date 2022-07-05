const { Op, fn, col } = require('sequelize');
const moment = require('moment');

class AdminService {

    constructor({Job: jobModel, Contract: contractModel, Profile: profileModel}) {
        this.jobModel = jobModel;
        this.contractModel = contractModel;
        this.profileModel = profileModel;
    }

    async getBestProfessionInDateRange(start, end) {

        if (!start || !end) {
            return { error: 'You should specify startDate and endDate', statusCode: 400 };
        }

        const startDate = moment(start, 'YYYY-MM-DD');
        const endDate = moment(end, 'YYYY-MM-DD');

        if(!startDate.isValid()) {
            return { error: 'Start date is not valid. Please use YYYY-MM-DD format', statusCode: 400 };
        }
        if(!endDate.isValid()) {
            return { error: 'End date is not valid. Please use YYYY-MM-DD format', statusCode: 400 };
        }

        const jobs = await this.jobModel.findAll({
            attributes: [
                'Contract.Contractor.profession',
                [fn('SUM', col('price')), 'totalPaid'],
            ],
            order: [
                [fn('SUM', col('price')), 'DESC'],
            ],
            where: {
                paid: true,
                [Op.and]: [
                    {
                        paymentDate:
                        {
                            [Op.gte]: startDate.startOf('day'),
                        }
                    },
                    {
                        paymentDate:
                        {
                            [Op.lte]: endDate.endOf('day'),
                        }
                    }
                ],
            },
            include: [
                {
                    model: this.contractModel,
                    include: [
                        {
                            model: this.profileModel,
                            as: 'Contractor',
                        }
                    ]
                },
            ],
            group: 'Contract.Contractor.profession',
        }) || [];

        if(jobs.length > 0) {
            const paymentsByProfession = jobs.map(job => ({ profession: job.Contract.Contractor.profession, paid: job.dataValues.totalPaid }));
            return paymentsByProfession[0];
        } else {
            return { error: 'There are no paid jobs during that date range' };
        }
    };

    async getBestClientsInDateRange(start, end, totalClients) {

        if(!start || !end) {
            return { error: 'You should specify startDate and endDate', statusCode: 400 };
        }

        const startDate = moment(start, 'YYYY-MM-DD');
        const endDate = moment(end, 'YYYY-MM-DD');
        const limit = totalClients || 2;

        if(!startDate.isValid()) {
            return { error: 'Start date is not valid. Please use YYYY-MM-DD format', statusCode: 400 };
        }
        if(!endDate.isValid()) {
            return { error: 'End date is not valid. Please use YYYY-MM-DD format', statusCode: 400 };
        }

        if(!parseInt(limit)) {
            return { error: 'Limit is not valid. Please specify a number', statusCode: 400 };
        }

        const jobs = await this.jobModel.findAll({
            attributes: [
                'Contract.Client.id',
                [fn('SUM', col('price')), 'totalPaid'],
            ],
            order: [
                [fn('SUM', col('price')), 'DESC'],
            ],
            limit: totalClients,
            where: {
                paid: true,
                [Op.and]: [
                    {
                        paymentDate:
                        {
                            [Op.gte]: moment(startDate, 'YYYY-MM-DD').startOf('day'),
                        }
                    },
                    {
                        paymentDate:
                        {
                            [Op.lte]: moment(endDate, 'YYYY-MM-DD').endOf('day'),
                        }
                    }
                ],
            },
            include: [
                {
                    model: this.contractModel,
                    include: [
                        {
                            model: this.profileModel,
                            as: 'Client',
                        }
                    ]
                },
            ],
            group: 'Contract.Client.id',
        }) || [];

        if(jobs.length > 0) {
            const paymentsByClient = jobs.map(job => {

                const client = job.Contract.Client;
                return {
                    clientProfileId: client.id,
                    firstName: client.firstName,
                    lastName: client.lastName,
                    paid: job.dataValues.totalPaid,
                };
            });
            return paymentsByClient;
        } else {
            return { error: 'There are no paid jobs during that date range' };
        }
    };

}

module.exports = { AdminService };
