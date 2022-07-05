const app = require('../app');
const request = require('supertest');

// NOTE: Current tests are depending on existing db seeds. They are coded based on
// pre-existing database seed data out of convenience and for demostration purposes only
// and we should always create idempotent tests that do not depend on pre-existing conditions.
// If in the future you want to continue testing we can either clean+seed the DB or
// just create data with code before and cleanup after
describe('admin', () => {

    describe('/admin/best-profession?start=<startDate>&end=<endDate>', () => {

        it('should fail when end date is missing', async () => {
            const response = await request(app)
                .get('/admin/best-profession?start=asdf')
                .expect(400)
                .set('profile_id', `1`);

            expect(response.body).toMatchObject({
                error: 'You should specify startDate and endDate',
            });
        });

        it('should fail when start date is missing', async () => {
            const response = await request(app)
                .get('/admin/best-profession?end=asdf')
                .expect(400)
                .set('profile_id', `1`);

            expect(response.body).toMatchObject({
                error: 'You should specify startDate and endDate',
            });
        });

        it('should fail when given a date in wrong format', async () => {
            const response = await request(app)
                .get('/admin/best-profession?start=wrong&end=wrong')
                .expect(400)
                .set('profile_id', `1`);

            expect(response.body).toMatchObject({
                error: 'Start date is not valid. Please use YYYY-MM-DD format'
            });
        });

        it('should return error message when there are no jobs to calculate the best profession', async () => {
            const response = await request(app)
                .get('/admin/best-profession?start=2010-01-01&end=2010-01-01')
                .expect(200)
                .set('profile_id', `1`);


            expect(response.body).toMatchObject({
                error: 'There are no paid jobs during that date range'
            });
        });

        it('should return the best paid profession in a date range', async () => {
            const response = await request(app)
                .get('/admin/best-profession?start=2020-08-14&end=2020-08-15')
                .expect(200)
                .set('profile_id', `1`);

            expect(response.body).toMatchObject({
                paid: 2483,
                profession: 'Programmer',
            });
        });
    });

    describe('/admin/best-clients', () => {

        it('should fail when end date is missing', async () => {
            const response = await request(app)
                .get('/admin/best-clients?start=asdf&limit=5')
                .expect(400)
                .set('profile_id', `1`);

            expect(response.body).toMatchObject({
                error: 'You should specify startDate and endDate',
            });
        });

        it('should fail when start date is missing', async () => {
            const response = await request(app)
                .get('/admin/best-clients?end=asdf&limit=5')
                .expect(400)
                .set('profile_id', `1`);

            expect(response.body).toMatchObject({
                error: 'You should specify startDate and endDate',
            });
        });

        it('should fail when given a date in wrong format', async () => {
            const response = await request(app)
                .get('/admin/best-clients?start=wrong&end=wrong&limit=5')
                .expect(400)
                .set('profile_id', `1`);

            expect(response.body).toMatchObject({
                error: 'Start date is not valid. Please use YYYY-MM-DD format'
            });
        });

        it('should fail when limit is not a valid number', async () => {
            const response = await request(app)
                .get('/admin/best-clients?start=2010-01-01&end=2010-01-01&limit=potato')
                .expect(400)
                .set('profile_id', `1`);

            expect(response.body).toMatchObject({
                error: 'Limit is not valid. Please specify a number',
            });
        });

        it('should return error message when there are no jobs to calculate the best client', async () => {
            const response = await request(app)
                .get('/admin/best-clients?start=2010-01-01&end=2010-01-01&limit=5')
                .expect(200)
                .set('profile_id', `1`);


            expect(response.body).toMatchObject({
                error: 'There are no paid jobs during that date range'
            });
        });

        it('should return the best clients ordered by payment', async () => {
            const response = await request(app)
                .get('/admin/best-clients?start=2010-01-01&end=2030-01-01&limit=3')
                .expect(200)
                .set('profile_id', `1`);

            console.log(response.body);
            expect(response.body).toMatchObject([
                { clientProfileId: 4, firstName: 'Ash', lastName: 'Kethcum', paid: 2020 },
                { clientProfileId: 2, firstName: 'Mr', lastName: 'Robot', paid: 442 },
                { clientProfileId: 1, firstName: 'Harry', lastName: 'Potter', paid: 442 }
            ]);
        });

        it('should correctly limit the amount of best clients', async () => {
            const response = await request(app)
                .get('/admin/best-clients?start=2010-01-01&end=2030-01-01&limit=1')
                .expect(200)
                .set('profile_id', `1`);

            console.log(response.body);
            expect(response.body).toMatchObject([
                { clientProfileId: 4, firstName: 'Ash', lastName: 'Kethcum', paid: 2020 },
            ]);
        });
    });
});