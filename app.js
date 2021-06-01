'use strict'
const express = require('express');
const morgan = require('morgan');
app.use(morgan('dev'));
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser');
require('dotenv/config');
app.use(cors())

var port = process.env.PORT || 4000;

require('./database/databaseConnection');
require('./eth/web3.config');

let bienesRouter = require('./routes/bienes');
let procesosRouter = require('./routes/procesos');
let contractRouter = require('./routes/contract');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', bienesRouter);
app.use('/api', procesosRouter);
app.use('/api', contractRouter);

app.get('/',(req,res) => {
    res.json({ message: "Api Auth" })
});

app.listen(port ,() =>{
  console.log(`Api runnig for port ${process.env.PORT}`);
})