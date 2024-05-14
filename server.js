const http = require('node:http');
const fs = require('fs');

let db_reg = './db_reg';

if (!fs.existsSync(db_reg)){
  fs.mkdir(db_reg, ()=>{})
}

if (!fs.existsSync("./db_reg/database.json")){
  fs.writeFile("./db_reg/database.json", "", ()=>{})
}


function validateForm(formData){
  const {firstName, lastName, Email, phone, gender} = formData;
  const errors_db = [];

  if (!firstName || !lastName){
    errors_db.push("First name and last name are required.");
  }

  if (firstName.length <= 1 || lastName.length <= 1){
    errors_db.push("Firat and LAst names can not be less than one charceter")
  }

  if(!/^[a-zA-Z]+$/.test(firstName) || !/[^a-zA-Z]+$/.test(lastName)){
    errors_db.push("First name and last name can not contain numbers.")
  }

  if(!/\S+\@\S+\.S+/.test(Email)){
    errors_db.push('Email must contain "@". Email Address contains invalid format.')
  }

  if(phone.length < 11 || phone.length > 11){
    errors_db.push("Phone number must be 11 characteracters")
  }
  if(!gender){
    errors_db.push("Gender is required, cannot be blank.")
  }

  return errors_db;
}
const serverRequestHandler = (req, res)=>{
  let errors_db = [];
  if(errors_db.length > 0 &&  req.url === '/submit' && req.method === 'POST'){
    res.writeHead(400, {"Content-Type": "application/json"})
  res.end(JSON.stringify({errors: errors_db}));
  }else if (req.url === '/submit' && req.method === 'POST' && (errors_db.length === 0)){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST");
   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    let body = [];

    res.on('data', (chunk)=>{
      body.push(chunk);}).on('end', ()=>{
          const parsedBody = Buffer.concat(body).toString();
          const formData = JSON.parse(parsedBody);
          const errors_db = validateForm(formData)

          fs.readFile('./db_reg/database.json', 'utf8', (err, jsonString) => {
            if (err) {
              console.log("File read failed:", err);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Internal Server Error" }));
              return;
            }
            const existingData = jsonString ? JSON.parse(jsonString) : [];
            existingData.push(formData);
            fs.writeFile('./db_reg/database.json', JSON.stringify(existingData), (err) => {
              if (err) {
                console.log("File write failed:", err);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Internal Server Error" }));
                return;
              }
              res.writeHead(200, { "Content-Type": "application/json" });

              res.end(JSON.stringify({ success: true }));
            });
          });
      })
  };

}
const server = http.createServer(serverRequestHandler);

server.listen("8000", "127.0.0.1", ()=>{
  console.log("I'm listeneing")

})

