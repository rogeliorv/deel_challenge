const express = require('express');
const { getProfileMiddleware } = require('./middleware/profileMiddleware');
const { Op, fn, col } = require("sequelize");
const moment = require('moment');

const adminRouter = express.Router();
adminRouter.use(getProfileMiddleware);

adminRouter.get('/best-profession', async (req, res) => {

    if(!req.query.start || !req.query.end) {
        return res.status(400).json({error: "You should specify startDate and endDate"});
    }

    const startDate = moment(req.query.start, 'YYYY-MM-DD');
    const endDate = moment(req.query.end, 'YYYY-MM-DD');

    if(!startDate.isValid()) {
        return res.status(400).json({error: "Start date is not valid. Please use YYYY-MM-DD format"});
    }
    if(!endDate.isValid()) {
        return res.status(400).json({error: "End date is not valid. Please use YYYY-MM-DD format"});
    }

    const { Job: JobModel, Contract: ContractModel, Profile: ProfileModel } = req.app.get('models');

    const jobs = await JobModel.findAll({
        attributes: [
            'Contract.Contractor.profession',
            [fn("SUM", col("price")), "totalPaid"],
        ],
        order: [
            [fn("SUM", col("price")), 'DESC'],
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
                model: ContractModel,
                include: [
                    {
                        model: ProfileModel,
                        as: 'Contractor',
                    }
                ]
            },
        ],
        group: 'Contract.Contractor.profession',
    }) || [];

    if(jobs.length > 0) {
        const paymentsByProfession = jobs.map(job => ({ profession: job.Contract.Contractor.profession, paid: job.dataValues.totalPaid }));
        return res.json(paymentsByProfession[0]);
    } else {
        return res.json({
            error: 'There are no paid jobs during that date range'
        });
    }
});

adminRouter.get('/best-clients', async (req, res) => {

    if(!req.query.start || !req.query.end) {
        return res.status(400).json({error: "You should specify startDate and endDate"});
    }

    const startDate = moment(req.query.start, 'YYYY-MM-DD');
    const endDate = moment(req.query.end, 'YYYY-MM-DD');
    const limit = req.query.limit || 2;

    if(!startDate.isValid()) {
        return res.status(400).json({error: "Start date is not valid. Please use YYYY-MM-DD format"});
    }
    if(!endDate.isValid()) {
        return res.status(400).json({error: "End date is not valid. Please use YYYY-MM-DD format"});
    }

    if(!parseInt(limit)) {
        return res.status(400).json({error: "Limit is not valid. Please specify a number"});
    }

    const { Job: JobModel, Contract: ContractModel, Profile: ProfileModel } = req.app.get('models');

    const jobs = await JobModel.findAll({
        attributes: [
            'Contract.Client.id',
            [fn("SUM", col("price")), "totalPaid"],
        ],
        order: [
            [fn("SUM", col("price")), 'DESC'],
        ],
        limit: limit,
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
                model: ContractModel,
                include: [
                    {
                        model: ProfileModel,
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
        return res.json(paymentsByClient);
    } else {
        return res.json({
            error: 'There are no paid jobs during that date range.'
        });
    }
});

module.exports = { adminRouter };
