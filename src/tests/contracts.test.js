const app = require('../app');
const request = require('supertest');

// NOTE: Current tests are depending on existing db seeds. This is for demostration purposes only
// If in the future you want to continue testing you should clean + seed tests before tests run
describe('getContract -> /contract/:id', () => {
    it('get the contract with a given id', async () => {
        const response = await request(app)
            .get("/contracts/1")
            .expect(200)
            .set("profile_id", `1`);

        expect(response.body).toMatchObject({
            id: 1,
            ClientId: 1,
            ContractorId: 5,
            status: 'terminated',
            terms: 'bla bla bla',
        });
    });
});