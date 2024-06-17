const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Customer = require('./customer')(sequelize, Sequelize);
db.Transfer = require('./transfer')(sequelize, Sequelize);

// Define associations
db.Customer.hasMany(db.Transfer, { foreignKey: 'senderId', as: 'sentTransfers' });
db.Customer.hasMany(db.Transfer, { foreignKey: 'receiverId', as: 'receivedTransfers' });
db.Transfer.belongsTo(db.Customer, { foreignKey: 'senderId', as: 'sender' });
db.Transfer.belongsTo(db.Customer, { foreignKey: 'receiverId', as: 'receiver' });

module.exports = db;
