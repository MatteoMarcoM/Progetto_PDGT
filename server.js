const express = require("express");
const app = express();

//app.use(express.json);

let utenti = [];

app.get("/", (req, res) => {
  console.log("Access to root");
  res.sendStatus(200);  //OK
});

//registra gli utenti
app.post("/register/:name", (req, res) => {
  const n = req.params.name;
  
  utenti.push(n);
  
  res.sendStatus(200);
  console.log("User successfully registered: "+n);
});

//accedi all'endpoint degli utenti
app.get("/utenti/:name", (req, res) =>{
  const n = req.params.name;
  let found = false;
  
  for(let i=0; i<utenti.length; i++){
    if(utenti[i]==n){
      found = true;
    }
  }
  
  if(found == false){
    res.sendStatus(404); //not found
    return;
  }
  
  //found
  const headerAccept = req.get('Accept');
  console.log('Accept: ' + headerAccept);
  
  res.format({
    'text/plain': () => {
      res.type('text/plain').send("libro di "+n+" in db");
    },
    
    'text/html': () => {
      res.type('text/html').send("<html><body><h1> libro di "+n+"</h1></body></html>");
    },
    
    'application/json': () => {
      res.json({
        name: n,
        book: "titolo libro"
      });
    },
    
    default: () => {
      res.sendStatus(406);
    }
  });
});

//app listen
const listener = app.listen(process.env.PORT, () => {
  console.log("Listening on port" + listener.address().port);
});