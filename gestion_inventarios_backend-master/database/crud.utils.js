const { db } = require('./databaseConnection');
const { QueryTypes} = require('sequelize')

const insertDB = (insert = '', vars = {}) => {
    return new Promise(async (resolve, reject) => {
        const response = await db.query(insert,
            { 
                type: QueryTypes.INSERT,
                replacements: vars
            })
        .catch(err => {
            reject(err);
        })

        resolve(response);
    })
}

const selectDB = (query = '', vars = {}) => {
    return new Promise(async (resolve, reject) => {
        const response = await db.query(query,
            { 
                type: QueryTypes.SELECT,
                replacements: vars
            })
        .catch(err => {
            reject(err);
        })

        resolve(response);
    })
}

const updateDB = (update = '', vars = {}) => {
    return new Promise(async (resolve, reject) => {
        const response = await db.query(update,
            { 
                type: QueryTypes.UPDATE,
                replacements: vars
            })
        .catch(err => {
            reject(err);
        })

        resolve(response);
    })
}

module.exports = {
    insertDB,
    selectDB,
    updateDB,
}