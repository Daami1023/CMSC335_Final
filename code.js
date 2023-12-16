const http = require('http');
const httpSuccessStatus = 200;
const fs = require("fs");
const express = require('express');
const app = express();
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 

const uri = process.env.MONGO_CONNECTION_STRING;
const databaseAndCollection = {db: "Final_Proj", collection:"QR"};

const { MongoClient, ServerApiVersion } = require('mongodb');
    const bodyParser = require("body-parser");
    app.use(bodyParser.urlencoded({extended:false}));
    if(process.argv.length != 3 ){
    process.stdout.write(`Need port number`);
    process.exit(0);
    }
    let port = process.argv[2];
    console.log(`Web server started and running at http://localhost:${port}`);

    process.stdin.setEncoding("utf8");

    const json = process.argv[2];
    const prompt = "Stop to shutdown the server: ";
    process.stdout.write(prompt);
    process.stdin.on("readable", function () {
      let dataInput = process.stdin.read();
      if (dataInput !== null) {
        let command = dataInput.trim();
        
         if(command == "stop"){
          console.log( "Shutting down the server");
          process.exit(0)
  
        }
        else{
          process.stdout.write('Invalid command: ' + command+ '\n');
        }
        process.stdout.write(prompt);
        process.stdin.resume();
      }
    });


    app.set("views", path.resolve(__dirname, "template"));

    app.set("view engine", "ejs");

    app.get("/", (request, response) => { 
    response.render("form");
    });



    app.listen(port);