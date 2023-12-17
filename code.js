const http = require('http');
const httpSuccessStatus = 200;
const fs = require("fs");
const express = require('express');
const app = express();
const path = require("path");
const fetch = require("node-fetch");
require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 
const uri = process.env.MONGO_CONNECTION_STRING;
const databaseAndCollection = {db: "Final_Proj", collection:"QR"};
const { MongoClient, ServerApiVersion } = require('mongodb');
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
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

    app.post("/result", async (request, response) => {

      html = "<style> body {background-color: pink} </style>";
      html+=`Here's Your qr for ${request.body.url} <br>`
      QR=`<img src="https://qrtag.net/api/qr_4.png?url=https://${request.body.url}" alt="qrtag"><br>`
      html+=QR;
        try {
            await client.connect();
           
            /* Inserting one movie */
            console.log("***** Inserting one QR *****");
            let QR = {name: request.body.name,
              email: request.body.email,
              url: request.body.url};
            await insertQR(client, databaseAndCollection, QR);    
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }

        let result = undefined;

    try {
        await client.connect();
        result = await lookupQRs(client, databaseAndCollection, request.body.name, request.body.email);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
}
  let table = "";
    html+=`All other QR codes from user with name: ${request.body.name}, and email: ${request.body.email}<br>`;
    for( let entry of result){
      console.log(entry)
      table+=`<tr><td>${entry.url}</td><td><img src="https://qrtag.net/api/qr_4.png?url=https://${entry.url}" alt="qrtag"><br></td></tr>`
    }
    html+=table;
    
      response.send(html);

})

async function insertQR(client, databaseAndCollection, QR) {
  const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(QR);

  console.log(`QR entry created with id ${result.insertedId}`);
}

async function lookupQRs(client, databaseAndCollection, name, email) {
  let filter = {name: name,
                email: email,};
  const cursor = client.db(databaseAndCollection.db)
  .collection(databaseAndCollection.collection)
  .find(filter);
  const result = await cursor.toArray();
  return result;
}



    app.listen(port);