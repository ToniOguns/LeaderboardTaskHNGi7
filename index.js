'use strict';
const http = require('http');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
//used to parse csv files
const csv = require('csv-parser');
// used to get environment variables
require('dotenv').config()

const app = express();
const server = http.createServer(app);
const port = 9000 || process.env.PORT;
let defaultExtension = 'csv';

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
 
var upload = multer({ storage: storage })


const fileVerification = function (req, res, next){
  //get the sent file
  const file = req.file
  //check if a file was sent
  if (!file) {
    //return status code and error message
    return res.status(400).send({
      status: false,
      message: 'Please upload a File'
    })
  }
  //get the file extension
  let index = file.originalname.indexOf(".");
  let extension = file.originalname.slice(index+1);
  //check if the extension is accepted
  if (extension.toLowerCase() != 'csv' && extension.toLowerCase() != 'json') {
    res.status(400).send({
      status: false,
      message: 'Invalid File Format'
    })
  }else{
    //set defaultExtension to the file extension
    defaultExtension = extension
    next()
  }
}

const displayLeaderBoard = function(req, res){
  res.sendFile(__dirname + '/src/leaderboard.html');
}

const sendFileData = function(req, res){
  //check the extension
  if (defaultExtension.toLowerCase() == 'csv') {
    var data =[]
    //read the file
    fs.createReadStream('uploads/myFile')
    //pass the file through a csv parser
    .pipe(csv())
    //on the load of each row, add it to an array
    .on('data', (row) => {
      data.push(row)
    })
    //after loading the data send it to the client
    .on('end', () => {
      console.log('CSV file successfully processed');
      res.send(data)
    }); 
  }
  else if (defaultExtension.toLowerCase() == 'json') {
    //get the raw data from the json file
    let rawdata = fs.readFileSync('uploads/myFile');
    //parse to a json format
    let jsonData = JSON.parse(rawdata);
    //get the data array
    let data =(jsonData.data)
    //send the data
    res.send(data)
  }
}

//ROUTES
app.route('/uploadfile').post(upload.single('myFile'), fileVerification, displayLeaderBoard);
app.route('/uploadfile').get(displayLeaderBoard);
// app.route('/leaderboard').get(generalBoard);
app.route('/data').get(sendFileData)
app.route('/').get(function(req, res){
  res.sendFile(__dirname + '/src/upload.html');

})

app.listen(port, function(){
  console.log(`Express server listening on port ${port}`);
})
