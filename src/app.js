const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const { contractsRouter } = require('./router/contractsRouter');
const { jobsRouter } = require('./router/jobsRouter');
const { balancesRouter } = require('./router/balancesRouter');
const { adminRouter } = require('./router/adminRouter');

const app = express();
// App setup
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

// Error handling
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({'message': err.message});
  return;
});

// Routers
app.use('/contracts', contractsRouter);
app.use('/jobs', jobsRouter);
app.use('/balances', balancesRouter);
app.use('/admin', adminRouter);

module.exports = app;