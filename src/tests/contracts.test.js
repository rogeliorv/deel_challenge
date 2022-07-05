const app = require('../app');
const request = require('supertest');

// NOTE: Current tests are depending on existing db seeds. They are coded based on
// pre-existing database seed data out of convenience and for demostration purposes only
// and we should always create idempotent tests that do not depend on pre-existing conditions.
// If in the future you want to continue testing we can either clean+seed the DB or
// just create data with code before and cleanup after
describe('contracts', () => {
    describe(' /contracts/:id', () => {
        it('should get the contract with a given id', async () => {
            const response = await request(app)
                .get('/contracts/1')
                .expect(200)
                .set('profile_id', `1`);

            expect(response.body).toMatchObject({
                id: 1,
                ClientId: 1,
                ContractorId: 5,
                status: 'terminated',
                terms: 'bla bla bla',
            });
        });

        it('should return 404 when given a contract id that doesnt exist', async () => {
            const response = await request(app)
                .get('/contracts/100')
                .expect(404)
                .set('profile_id', `1`);

            expect(response.body.error).toBeDefined();
        });

        it('should return Unauthorized when looking for a contract if profile_id is missing from headers', async () => {
            const response = await request(app)
                .get('/contracts/100')
                .expect(401);
        });
    });

    describe('/jobs/:jobId/pay', () => {
        it('should pay the given job', async () => {
            const response = await request(app)
                .get('/contracts')
                .expect(200)
                .set('profile_id', `1`);

            expect(response.body).toMatchObject(
                [
                    {
                        ClientId: 1,
                        ContractorId: 6,
                        id: 2,
                        status: 'in_progress',
                        terms: 'bla bla bla',
                    }
                ]
            );
        });

        it('should return empty list when given a profile does not have any contracts', async () => {
            const response = await request(app)
                .get('/contracts')
                .expect(200)
                .set('profile_id', `9`);
                expect(response.body).toMatchObject([]);
        });

        it('should return Unauthorized when looking for a contract if profile_id is missing from headers', async () => {
            const response = await request(app)
                .get('/contracts')
                .expect(401);
        });
    });
});