const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const { contractsRouter } = require('./contractsRouter');
const { jobsRouter } = require('./jobsRouter');
const { balancesRouter } = require('./balancesRouter');
const { adminRouter } = require('./adminRouter');

const app = express();
// App setup
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

// Routers
app.use('/contracts', contractsRouter);
app.use('/jobs', jobsRouter);
app.use('/balances', balancesRouter);
app.use('/admin', adminRouter);

module.exports = app;