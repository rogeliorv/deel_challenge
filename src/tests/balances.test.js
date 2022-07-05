const app = require('../app');
const request = require('supertest');

// NOTE: Current tests are depending on existing db seeds. They are coded based on
// pre-existing database seed data out of convenience and for demostration purposes only
// and we should always create idempotent tests that do not depend on pre-existing conditions.
// If in the future you want to continue testing we can either clean+seed the DB or
// just create data with code before and cleanup after
describe('balances', () => {

    describe('/balances/deposit/:userId', () => {

        it('should fail when there is no profile authenticated', async () => {
            const userId = 1;
            await request(app)
                .post(`/balances/deposit/${userId}`)
                .expect(401)
        });

        it('should fail when there is no deposit amount', async () => {
            const userId = 1;
            const response = await request(app)
                .post(`/balances/deposit/${userId}`)
                .set('profile_id', `1`)
                .expect(400)

            expect(response.body).toMatchObject({
                error: 'You need to specify the depositAmount',
            });
        });

        it('should fail when deposit amount is invalid', async () => {
            const userId = 1;
            const response = await request(app)
                .post(`/balances/deposit/${userId}`)
                .set('profile_id', `1`)
                .send({depositAmount: 'potato'})
                .expect(400)

            expect(response.body).toMatchObject({
                error: 'DepositAmount must be a positive integer',
            });
        });

        it('should fail when trying to deposit more than 25% of the total jobs', async () => {
            const userId = 1;
            const response = await request(app)
                .post(`/balances/deposit/${userId}`)
                .set('profile_id', `1`)
                .send({depositAmount: '1000'})
                .expect(400)

            expect(response.body.error).toContain('Cannot deposit more than 25%');
        });

        it('should deposit successfully', async () => {
            const userId = 1;
            const response = await request(app)
                .post(`/balances/deposit/${userId}`)
                .set('profile_id', `1`)
                .send({depositAmount: '50'})
                .expect(200)

            expect(response.body).toMatchObject({
                newBalance: 1200,
                oldBalance: 1150,
                success: true,
                profile: {
                    balance: 1200,
                    id: userId,
                    type: 'client',
                },
            });
        });
    });
});