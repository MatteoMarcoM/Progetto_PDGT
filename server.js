const express = require("express");
const app = express();

//app.use(express.json);

let utenti = [];

app.get("/", (req, res) => {
  console.log("Access to root");
  res.sendStatus(200);  //OK
});

app.post("/register/:name", (req, res) => {
  const n = req.params.name;
  
  utenti.push(n);
  
  res.sendStatus(200);
  console.log("User successfully registered: "+n);
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Listening on port" + listener.address().port);
});