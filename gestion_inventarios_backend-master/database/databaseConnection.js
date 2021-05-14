const { Sequelize } = require('sequelize');


const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PW, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
    // ssl: true,
    port: process.env.DB_PORT,
    logging: false,
    // pool: {
    //     max: 5,
    //     min: 0,
    //     idle: 20000,
    //     acquire: 20000
    // }
});

db.authenticate()
    .then(() => {
        console.log('\x1b[34mPostgreSQL\x1b[0m', 'Database \x1b[32m ONLINE \x1b[0m ');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = { db };