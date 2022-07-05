const express = require('express');
const { getProfileMiddleware } = require('./middleware/profileMiddleware');
const { Op } = require("sequelize");

const contractsRouter = express.Router();
contractsRouter.use(getProfileMiddleware);

contractsRouter.get('/:id', async (req, res) =>{
    const { id } = req.params;
    const { Contract: ContractModel } = req.app.get('models');
    const contract = await ContractModel.findOne({
        where: {
            id,
            [Op.or]: [
                {
                     ClientId: req.profile.id,
                },
                {
                    ContractorId: req.profile.id,
                }
            ],
        }});

    if (!contract) {
        return res.status(404).end()
    }

    res.json(contract)
});

contractsRouter.get('/', async (req, res) =>{
    const { Contract: ContractModel } = req.app.get('models');
    const userContracts = await ContractModel.findAll({
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
    }});

    res.json(userContracts)
});


module.exports = { contractsRouter };
