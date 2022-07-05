# Made by @rogeliorv - Sample expressjs app + sequelize + sqlite + jest

This is a backend exercise. Good for showing some basic work on REST API using NodeJS and Express

## Data Models

> **Models are defined in src/model.js**

### Profile
A profile can be classified as `client` or a `contractor`.
Clients create contracts with contractors. contractor does jobs for clients and get paid.
Each profile has a balance property.

### Contract
A contract between and client and a contractor.
Contracts have 3 statuses, `new`, `in_progress`, `terminated`. contracts are considered active only when in status `in_progress`
Contracts group jobs within them.

### Job
contractor get paid for jobs by clients under a certain contract.

## Getting started


1. `npm install`
2. `npm run seed` (To populate the db) **Warning: This will drop the database if it exists**.
3. `npm start` which should start both the server
4. `npm test` should run tests using Jest


## Implemented APIs

***GET*** `/contracts/:id` - Returns the contract only if it belongs to the profile calling.
***GET*** `/jobs/unpaid` -  Get all unpaid jobs for a user (***either*** a client or contractor), for ***active contracts only***.
***POST*** `/jobs/:job_id/pay` - Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.
***POST*** `/balances/deposit/:userId` - Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)
***GET*** `/admin/best-profession?start=<date>&end=<date>` - Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.
***GET*** `/admin/best-clients?start=<date>&end=<date>&limit=<integer>` - returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.
