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

//reset mappa
data = new Map();

app.get("/", (req, res) => {
  console.log("Access to root");
  res.sendStatus(200); //OK
});

// package per hashing
const sha256 = require("js-sha256");

// registra gli utenti
// NB ':password' è in chiaro
app.put("/utenti/register/:name/:password", (req, res) => {
  const name = req.params.name;
  const pass = req.params.password;

  // verifico che non ci siano spazi
  // search restituisce -1 se non trova occorrenze
  if (name.search(" ") != -1 || pass.search(" ") != -1) {
    console.log("Username or password not valid");
    res.sendStatus(403); //Forbidden
    return;
  }

  //verifico se il nome è già utilizzato
  if (data.has(name)) {    
    console.log("Username: " + name + " is invalid because is already used");
    res.sendStatus(403); //Forbidden
    return;
  }

  //aggiungo nuovo utente senza libri
  const salt = generateSalt(6);
  console.log("Salt of " + name + " : " + salt);

  let hashPass = sha256.create();
  hashPass.update(salt + pass);
  const hash = hashPass.hex();
  console.log("Hash salt+pass of " + name + " : " + hash);

  data.set(name, { libri: [], hash: hash, salt: salt });

  res.sendStatus(200); //OK
  console.log("User successfully registered: " + name);
});

function generateSalt(n) {
  let salt = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz" + "0123456789";
  for (var i = 0; i < n; i++) {
    salt += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return salt;
}

//autenticazione utenti
const jwt = require("njwt");
// setto una stringa arbitraria per firmare i jwt
// nel file di environment
const secret = process.env.JWT_SECRET;

// autenticazione con meccanismo jwt tramite Basic authentication
// dopo la registrazione (sign-in) ottengo il cookie di sessione (log-in)
app.post("/utenti/login/jwt", (req, res) => {
  if (!req.headers.authorization) {
    res.sendStatus(401); //Unauthorized
    return;
  }

  console.log("Authorization: " + req.headers.authorization);

  if (!req.headers.authorization.startsWith("Basic ")) {
    res.sendStatus(401); //Unauthorized
    return;
  }

  console.log("Basic authentication");

  // ignoro i primi 6 caratteri dell'autorizzazione (Basic )
  const auth = req.headers.authorization.substr(6);
  const decoded = Buffer.from(auth, "base64").toString();
  console.log("Decoded: " + decoded);

  const [username, password] = decoded.split(":"); //username:password
  console.log("Username: " + username + " password: " + password);

  if (!data.has(username)) {
    res.sendStatus(401); //Unauthorized
    return;
  }
  const user = data.get(username);
  console.log("Login as " + username + ", real hash " + user.hash);

  //hashing
  let h = sha256.create();
  h.update(user.salt + password);
  const hashed = h.hex();

  console.log("Hash calculated: " + hashed + ", expected: " + user.hash);

  if (hashed == user.hash) {
    const claims = {
      subj: username,
      group: "biblioteca",
      libri: user.libri
    };

    const token = jwt.create(claims, secret);
    token.setExpiration(new Date().getTime() + 60000); //60 sec
    console.log("New token: " + token.compact());

    res.cookie("sessionToken", token.compact());
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

//verifica token
// ritorna true se ha successo
function verifyToken(req, res) {
  if (!req.cookies.sessionToken) {
    res.sendStatus(401); //Unauthorized
    return false;
  }

  // richiede cookie-parser (express)
  const token = req.cookies.sessionToken;
  console.log("Token: " + token);

  // ottengo il token verificato
  let verifiedToken;
  try {
    verifiedToken = jwt.verify(token, secret);
  } catch {
    //token expired
    res.sendStatus(401); //Unauthorized
    return false;
  }
  console.log("verifiedToken: " + verifiedToken);

  // verifico che chi ha firmato il token sia l'utente corretto
  if (verifiedToken.body.subj == req.params.name) {
    return true;
  } else {
    res.sendStatus(403); //Forbidden
    return false;
  }
}

//verifica cookie sessione
app.get("/utenti/:name/secret/jwt", (req, res) => {
  const name = req.params.name;

  if (!data.has(name)) {
    res.sendStatus(404); //Not Found
    return;
  }

  if (verifyToken(req, res)) {
    res.type("text/plain").send("Documento segreto di " + name);
    return;
  }
});

//deregistra utente
app.delete("/utenti/remove/:name", (req, res) => {
  const name = req.params.name;
  
  if (data.has(name)) {
    if (!verifyToken(req, res)) return;
    data.delete(name);
    console.log("User: " + name + " deleted!");
    res.sendStatus(200);
  } else {
    res.sendStatus(404); //Not Found
  }
});

// Negoziazione della codifica
function negoziaCodifica(stampa, req, res, subj) {
  // subj (soggetto) è 'libri' o 'utenti'
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
        subj: subj,
        content: stampa.split("\n")
      });
    },

    default: () => {
      res.sendStatus(406); //Not Acceptable
    }
  });
}

//endpoint per la lista degli utenti registrati
app.get("/utenti", (req, res) => {
  let lista = "";

  for (var [key, val] of data) {
    lista += key + "\n";
  }

  negoziaCodifica(lista, req, res, "utenti");
});

//accedi all'endpoint degli utenti
app.get("/utenti/:name", (req, res) => {
  const name = req.params.name;

  if (!data.has(name)) {
    res.sendStatus(404); //Not Found
    return;
  }

  //found
  res.type("text/plain").send("Biblioteca personale di " + name);
});

//endpoint per aggiungere un libro
app.put("/utenti/:name/libri/add/:lib", (req, res) => {
  const name = req.params.name;
  const libro = req.params.lib;

  if (!verifyToken(req, res)) return;

  //aggiungo il libro
  let found = false;
  if (data.has(name)) {
    let user = data.get(name);
    user.libri.forEach(function(item, index, array) {
      if (user.libri[index] == libro) {
        found = true;
      }
    });

    //libro non trovato allora lo aggiungo
    if (found == false) {
      user.libri.push(libro);
      console.log("Aggiunto libro: " + libro + " a utente: " + name);
      res.sendStatus(200); //OK
    } else {
      console.log("Libro: " + libro + " gia' presente");
      res.sendStatus(200); //OK
    }
  } else {
    res.sendStatus(404); //Not Found
  }
});

//endpoint per rimuovere un libro
app.delete("/utenti/:name/libri/remove/:lib", (req, res) => {
  const name = req.params.name;
  const libro = req.params.lib;

  if (!verifyToken(req, res)) return;

  let found = false;
  if (data.has(name)) {
    //rimuovo il libro dell'utente
    let user = data.get(name);
    user.libri.forEach(function(item, index, array) {
      if (user.libri[index] == libro) {
        delete user.libri[index];
        found = true;
      }
    });

    if (found == true) {
      res.sendStatus(200); //OK
      console.log("Rimosso il libro: " + libro + " a utente: " + name);
    } else {
      //libro non trovato
      res.sendStatus(404); //Not Found
    }
  } else {
    res.sendStatus(404); //Not Found
    return;
  }
});

// sostituisci un libro gia' presente con un nuovo libro
app.post("/utenti/:name/libri/rename/:old/:new", (req, res) => {
  let name = req.params.name;
  let oldB = req.params.old;
  let newB = req.params.new;
  let found = false;

  if (!data.has(name)) {
    res.sendStatus(404); //Not Found
    return;
  }

  if (!verifyToken(req, res)) return;

  let user = data.get(name);
  user.libri.forEach(function(item, index, array) {
    if (user.libri[index] == oldB) {
      delete user.libri[index];
      found = true;
    }
  });

  if (found == true) {
    // solo una volta (fuori forEach)
    user.libri.push(newB);
    res.sendStatus(200); //OK
  } else {
    res.sendStatus(404); //Not Found
  }
});

//endpoint per ottenere la lista dei libri
app.get("/utenti/:name/libri", (req, res) => {
  let name = req.params.name;

  if (!data.has(name)) {
    res.sendStatus(404); //not found
    return;
  }

  if (!verifyToken(req, res)) return;

  //restituisco la lista dei libri
  let lista = data.get(name).libri.join("\n");

  negoziaCodifica(lista, req, res, "libri");
});

//app listen
const listener = app.listen(process.env.PORT, () => {
  console.log("Listening on port" + listener.address().port);
});
