const { BalancesService } = require("../services/balancesService");

class BalancesController {

    async deposit(req, res) {
        const balancesService = new BalancesService(req.app.get('models'));
        const { userId } = req.params;
        const depositAmount = req.body.depositAmount;
        const result = await balancesService.deposit(userId, depositAmount);

        if (result.statusCode) {
            return res.status(result.statusCode).json(result);
        } else if(result.error) {
            return res.json(400).json(result);
        }

        return res.json(result);
    }
}

module.exports = { BalancesController };