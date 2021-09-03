const express = require("express");
const app = express();

// per leggere i cookie nell'endpoint 'verifica cookie sessione'
// req.cookies.<nomeDelCookie>
const cookieparser = require("cookie-parser"); //middleware Express
app.use(cookieparser());

//mappa javascript (nome, {dizionario chiave valore})
let data = new Map();
data.set("Mario", {
  libri: ["libro1", "libro2"],
  hash: "sdkjl4n09nc0v35obv7be9t8t",
  salt: "123456"
});
//let newId = 2; // id incrementale nuovo utente

//reset mappa
data = new Map();
//newId = 1;

app.get("/", (req, res) => {
  console.log("Access to root");
  res.sendStatus(200); //OK
});

//package per hashing
const sha256 = require("js-sha256");

//registra gli utenti
//NB PASS IN CHIARO
app.put("/utenti/register/:name/:password", (req, res) => {
  const n = req.params.name;
  const pass = req.params.password;

  //verifico che non ci siano spazi
  // search restituisce -1 se non trova occorrenze
  if (n.search(" ") != -1 || pass.search(" ") != -1) {
    res.sendStatus(403); //forbidden
    return;
  }

  //verifico se il nome è già utilizzato
  //for (let i = 1; i < newId; i++) {
  if (data.has(n)) {
    res.sendStatus(403); //forbidden
    return;
    //}
  }

  //aggiungo nuovo utente senza libri
  const salt = generateSalt(6);
  console.log(salt);
  
  let hashPass = sha256.create();
  hashPass.update(salt+pass);
  const hash = hashPass.hex();
  console.log(hash);
  
  data.set(n, { libri: [], hash: hash, salt: salt});
  //newId++;

  res.sendStatus(200);
  console.log("User successfully registered: " + n);
});

function generateSalt(n){
  let salt = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i < characters.length; i++ ) {
      salt += characters.charAt(Math.floor(Math.random() * characters.length));
   }
  return salt;
}

//autenticazione utenti
const jwt = require("njwt");
// setto una stringa arbitraria per firmare i jwt
// nel file di environment
const secret = process.env.JWT_SECRET;

// autenticazione con meccanismo jwt
// dopo il login ottengo il cookie di sessione
app.post("/utenti/login/jwt", (req, res) => {
  if (!req.headers.authorization) {
    //Unauthorized
    res.sendStatus(401);
    return;
  }

  console.log("Authorization: " + req.headers.authorization);

  if (!req.headers.authorization.startsWith("Basic ")) {
    res.sendStatus(401);
    return;
  }

  console.log("Basic authentication");

  // ignoro i primi 6 caratteri dell'autorizzazione (Basic:)
  const auth = req.headers.authorization.substr(6);
  const decoded = Buffer.from(auth, "base64").toString();
  console.log("Decoded: " + decoded);

  const [username, password] = decoded.split(":"); //username:password
  console.log("Username: " + username + " password: " + password);

  if (!data.has(username)) {
    res.sendStatus(401);
    return false;
  }
  const user = data.get(username);
  console.log("Login come " + username + ", hash effettivo " + user.hash);

  //hashing
  let h = sha256.create();
  h.update(user.salt + password);
  const hashed = h.hex();

  console.log("Hash: " + hashed + ", expected: " + user.hash);

  if (hashed == user.hash) {
    const claims = {
      subj: username,
      group: "biblioteca",
      libri: user.libri
    };

    const token = jwt.create(claims, secret);
    token.setExpiration(new Date().getTime() + 10000);
    console.log("New token: " + token.compact());

    res.cookie("sessionToken", token.compact());
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

function foundUser(name) {
  let found = false;

  //ciclo sugli id esistenti e ottengo il nome dai
  // vari dizionari, da confrontare con name
  //for (let i = 1; i < newId; i++) {
  if (data.has(name)) {
    found = true;
  }
  //}
  return found;
}

//verifica token
// ritorna 0 se ha successo 
// ritorna 1 per errore 401
// ritorna 2 per errore 403
// ritorna 3 se fallisce la verifica
function verifyToken(req, res){

  let toReturn = 3;
  
  if (!req.cookies.sessionToken) {
    toReturn = 1;
    //res.sendStatus(401);
    //return;
  }

  // richiede cookie-parser (express)
  const token = req.cookies.sessionToken;
  console.log("Token: " + token);
  
  let func = function(err, verifiedToken) {
    if (err) {
      console.log(err);
      //res.sendStatus(401);
      toReturn = 1;
    } else {
      console.log(verifiedToken);
      if (verifiedToken.body.subj == req.params.name) {
        //res.send("Documento segreto di " + req.params.name);
        //res.sendSatus(200);
        toReturn = 0;
      } else {
        //res.sendStatus(403);
        toReturn =  2;
      }
    }
  };
  
  jwt.verify(token, secret, func);
  console.log('debug: '+toReturn);
  return toReturn;
}
//verifica cookie sessione
app.get("/utenti/:name/secret/jwt", (req, res) => {
  const name = req.params.name;

  if (foundUser(name) === false) {
    res.sendStatus(404); //not found
    return;
  }
  
  if(verifyToken(req, res) === 1){
    res.sendSatus(401);
    return;
  }
  
  if(verifyToken(req, res) === 2){
    res.sendSatus(403);
    return;
  }
  
  if(verifyToken(req, res) === 0){
    res.sendSatus(200);
    res.send("Documento segreto di " + name);
    return;
  }
  // errore generico server
  // la verifica è fallita
  res.sendStatus(500);
  
  //verifyToken(req, res);
});  
//fine autorizzazione

//CORREGGERE BUG
//deregistra utente
app.delete("/utenti/remove/:name", (req, res) => {
  const n = req.params.name;
  let found = false;

  //for (let id = 1; id < newId; id++) {
  if (data.has(n)) {
    data.delete(n.toString());
    //delete data.get(n);
    found = true;
    //break;
    //newId--;
    //data.get(id).name = '';
    //data.get(id).libri = {};
    //altrimenti il valore id viene eliminato e
    //la mappa rimane male indicizzata
    //}
  }

  if (found == true) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

function negoziaCodifica(stampa, req, res, subj) {
  // subj (soggetto) è 'libri' o 'utenti'
  // Negoziazione della codifica
  const headerAccept = req.get("Accept");
  console.log("Accept: " + headerAccept);
  res.format({
    "text/plain": () => {
      res.type("text/plain").send("Lista " + subj + ":\n" + stampa);
    },

    "text/html": () => {
      res
        .type("text/html")
        .send("<html><body>Lista " + subj + ":\n" + stampa + "</body></html>");
    },

    "application/json": () => {
      res.json({
        subj: stampa.split("\n")
      });
    },

    default: () => {
      res.sendStatus(406);
    }
  });
}

//endpoint per la lista degli utenti registrati
app.get("/utenti", (req, res) => {
  let lista = "";
  /*
  for (let i = 1; i < newId; i++) {
    lista += data.get(i).name + "\n";
  }*/

  for (var [key, val] of data) {
    //console.log(key + ": " + val);
    lista += key + "\n";
  }

  negoziaCodifica(lista, req, res, "utenti");
});

//accedi all'endpoint degli utenti
app.get("/utenti/:name", (req, res) => {
  const n = req.params.name;

  if (foundUser(n) == false) {
    res.sendStatus(404); //not found
    return;
  }

  //found
  res.type("text/plain").send("Biblioteca personale di " + n);
});

//endpoint per aggiungere un libro
app.put("/utenti/:name/libri/:libro", (req, res) => {
  const name = req.params.name;
  const libro = req.params.libro;

  if (foundUser(name) == false) {
    res.sendStatus(404); //not found
    return;
  }
  
  if(verifyToken(req) != 0){
    res.send('Cookie Session Error');
    return;
  }

  //aggiungo il libro
  //for (let i = 1; i < newId; i++) {
  //let utente = data.get(i);

  if (data.has(name)) {
    data.libri.push(libro);
    //}
  }

  res.sendStatus(200);
  console.log("Aggiunto libro: " + libro + " a utente: " + name);
});

//endpoint per rimuovere un libro
app.delete("/utenti/:name/libri/remove/:lib", (req, res) => {
  const name = req.params.name;
  const libro = req.params.lib;

  if (foundUser(name) == false) {
    res.sendStatus(404); //not found
    return;
  }
  
  if(verifyToken(req) != 0){
    res.send('Cookie Session Error');
    return;
  }

  //trovo l'utente
  //for (let i = 1; i < newId; i++) {
  //let utente = data.get(i);

  if (data.has(name)) {
    //rimuovo il libro dell'utente

    //CHIEDERE PROF PERCHé NON FA COL FOR

    /*for(let j=0; j<utente.libri.lenght; j++){
        if(utente.libri[j] == libro)
          delete utente.libri[j];
      }
      data.libri.forEach(function(item, index, array) {
        console.log(item, index);
        if (utente.libri[index] == libro) delete utente.libri[index];
      });*/

    for (var [key, val] of data) {
      //console.log(key + ": " + val);
      val.forEach(function(item, index, array) {
        console.log(item, index);
        if (val[index] == libro) delete val[index];
      });
    }
    //}
  }

  res.sendStatus(200);
  console.log("Rimosso il libro: " + libro + " a utente: " + name);
});

//BUG?
//UPDATE - post
app.post("utenti/:name/libri/rename/:old/:new", (req, res) => {
  let name = req.params.name;
  let oldB = req.params.old;
  let newB = req.params.new;
  let found = false;

  if (!foundUser(name)) {
    console.log("User " + name + " not found");
    res.sendStatus(404); //not found
    return;
  }
  
  if(verifyToken(req) != 0){
    res.send('Cookie Session Error');
    return;
  }

  /*
  for (let i = 1; i < newId; i++) {
    let utente = data.get(i);

    if (data.has(name)) {
      utente.libri.forEach(function(item, index, array) {
        if (utente.libri[index] == oldB.toString()) {
          //delete utente.libri[index];
          utente.libri.push(newB.toString());
          found = true;
        }
      });
    }
  }*/

  for (var [key, val] of data) {
    //console.log(key + ": " + val);
    val.forEach(function(item, index, array) {
      console.log(item, index);
      if (val[index] == oldB.toString()) {
        val.push(newB.toString());
        found = true;
      }
    });
  }

  if (found == true) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

//endpoint per ottenere la lista dei libri
app.get("/utenti/:name/libri", (req, res) => {
  let name = req.params.name;

  if (!foundUser(name)) {
    console.log("User " + name + " not found");
    res.sendStatus(404); //not found
    return;
  }
  
  if(verifyToken(req) != 0){
    res.send('Cookie Session Error');
    return;
  }

  //restituisco la lista dei libri
  let lista = "";
  let utente = undefined;
  /*
  for (let i = 1; i < newId; i++) {
    utente = data.get(i);

    if (utente.name == name) {
      //ottengo tutti i libri su diverse righe
      lista = utente.libri.join("\n");
      break; //utente è l'utente cercato
    }
  }*/

  for (var [key, val] of data) {
    if (key == name) {
      //ottengo tutti i libri su diverse righe
      lista = val.join("\n");
      break; //utente è l'utente cercato
    }
  }

  negoziaCodifica(lista, req, res, "libri");
});

//app listen
const listener = app.listen(process.env.PORT, () => {
  console.log("Listening on port" + listener.address().port);
});
