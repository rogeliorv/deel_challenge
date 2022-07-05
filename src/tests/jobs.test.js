const app = require('../app');
const request = require('supertest');
// const { sequelize } = require('../model');

// NOTE: Current tests are depending on existing db seeds. They are coded based on
// pre-existing database seed data out of convenience and for demostration purposes only
// and we should always create idempotent tests that do not depend on pre-existing conditions.
// If in the future you want to continue testing we can either clean+seed the DB or
// just create data with code before and cleanup after
describe('jobs', () => {

    beforeAll(async () => {
        // return await sequelize.sync({force: true});
    });

    describe('/jobs/unpaid', () => {
        it('should return a list of unpaid jobs', async () => {
            const response = await request(app)
                .get('/jobs/unpaid')
                .expect(200)
                .set('profile_id', `1`);

            expect(response.body).toMatchObject([
                    {
                        ContractId: 2,
                        description: 'work',
                        id: 2,
                        paid: null,
                        paymentDate: null,
                        price: 201,
                    },
                ]
            );
        });

        it('should not return a paid job', async () => {
            const response = await request(app)
                .get('/jobs/unpaid')
                .expect(200)
                .set('profile_id', `2`);

            const isEverythingUnpaid = response.body.reduce(
                (acc, unpaidElement) => acc && unpaidElement.paid === null && unpaidElement.paymentDate === null,
                true,
            );
            expect(isEverythingUnpaid).toBe(true);
        });

        it('should return an empty list when no unpaid jobs', async () => {
            const response = await request(app)
                .get('/jobs/unpaid')
                .expect(200)
                .set('profile_id', `5`);

            expect(response.body).toMatchObject([]);
        });

        it('should return 401 if no profile header is present', async () => {
            const response = await request(app)
                .get('/jobs/unpaid')
                .expect(401)

        });
    });

    describe('/jobs/:jobId/pay', () => {

        it('should return error if the contract for the job is already terminated', async () => {

            const response = await request(app)
                .post('/jobs/1/pay')
                .expect(400)
                .set('profile_id', `1`);


            expect(response.body.error).toContain('terminated');
        });

        it('should return 401 if no profile header is present', async () => {
            const response = await request(app)
                .post('/jobs/1/pay')
                .expect(401)
        });

        it('should pay for the job', async () => {

            const jobId = 2;

            const response = await request(app)
                .post(`/jobs/${jobId}/pay`)
                .expect(200)
                .set('profile_id', `1`);

            expect(response.body).toMatchObject({
                success: true,
                job: {
                    ContractId: 2,
                    description: 'work',
                    id: jobId,
                    paid: true,
                    price: 201,
                },
                profile: {
                    balance: 949,
                    firstName: 'Harry',
                    id: 1,
                    lastName: 'Potter',
                    profession: 'Wizard',
                    type: 'client',
                }
            });
        });

        it('should fail to pay for an already paid job', async () => {
            const jobId = 2;
            const response = await request(app)
                .post(`/jobs/${jobId}/pay`)
                .expect(200)
                .set('profile_id', `1`);

            expect(response.body).toMatchObject({
                success: true,
                message: `Job with id ${jobId} is already paid`,
                job: {
                    ContractId: 2,
                    description: 'work',
                    id: jobId,
                    paid: true,
                    price: 201,
                },
            });
        });

        it('should fail if the client does not have enough balance to pay', async () => {
            const jobId = 5;
            const response = await request(app)
                .post(`/jobs/${jobId}/pay`)
                .expect(400)
                .set('profile_id', `1`);

            expect(response.body).toMatchObject({
                success: false,
                error: `Client does not have enough balance to pay for jobId ${jobId}`,
                job: {
                    ContractId: 7,
                    description: 'work',
                    id: jobId,
                    paid: null,
                    price: 200,
                },
            });
        });

    });
});