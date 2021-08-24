const express = require("express");
const app = express();

//autenticazione?

//mappa javascript (id, {dizionario chiave valore})
let data = new Map();
data.set(1, { name: "Mario", libri: ["libro1", "libro2"] });
let newId = 2; // id incrementale nuovo utente

//reset mappa
data = new Map();
newId = 1;

app.get("/", (req, res) => {
  console.log("Access to root");
  res.sendStatus(200); //OK
});

//registra gli utenti
app.put("/utenti/register/:name", (req, res) => {
  const n = req.params.name;

  //verifico che non ci siano spazi
  if (n.search(" ") != -1) {
    res.sendStatus(403); //forbidden
    return;
  }

  //verifico se il nome è già utilizzato
  for (let i = 1; i < newId; i++) {
    if (data.get(i).name == n) {
      res.sendStatus(403); //forbidden
      return;
    }
  }

  //aggiungo nuovo utente senza libri
  data.set(newId, { name: n, libri: [] });
  newId++;

  res.sendStatus(200);
  console.log("User successfully registered: " + n);
});

function foundUser(name) {
  let found = false;

  //ciclo sugli id esistenti e ottengo il nome dai
  // vari dizionari, da confrontare con name
  for (let i = 1; i < newId; i++) {
    if (data.get(i).name == name) {
      found = true;
    }
  }
  return found;
}

//CORREGGERE BUG
//deregistra utente
app.delete("utenti/remove/:name", (req, res) => {
  const n = req.params.name;
  let found = false;

  for (let id = 1; id < newId; id++) {
    if (data.get(id).name == n) {
      data.delete(id);
      //delete data.get(id);
      found = true;
      break;
      //newId--;
      //data.get(id).name = '';
      //data.get(id).libri = {};
      //altrimenti il valore id viene eliminato e
      //la mappa rimane male indicizzata
    }
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
  for (let i = 1; i < newId; i++) {
    lista += data.get(i).name + "\n";
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

//endpoint per aggiungiere un libro
app.put("/utenti/:name/libri/:libro", (req, res) => {
  const name = req.params.name;
  const libro = req.params.libro;

  if (foundUser(name) == false) {
    res.sendStatus(404); //not found
    return;
  }

  //aggiungo il libro
  for (let i = 1; i < newId; i++) {
    let utente = data.get(i);

    if (utente.name == name) {
      utente.libri.push(libro);
    }
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

  //trovo l'utente
  for (let i = 1; i < newId; i++) {
    let utente = data.get(i);

    if (utente.name == name) {
      //rimuovo il libro dell'utente

      //CHIEDERE PROF PERCHé NON FA COL FOR

      /*for(let j=0; j<utente.libri.lenght; j++){
        if(utente.libri[j] == libro)
          delete utente.libri[j];
      }*/
      utente.libri.forEach(function(item, index, array) {
        console.log(item, index);
        if (utente.libri[index] == libro) delete utente.libri[index];
      });
    }
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

  for (let i = 1; i < newId; i++) {
    let utente = data.get(i);

    if (utente.name == name) {
      utente.libri.forEach(function(item, index, array) {
        if (utente.libri[index] == oldB.toString()) {
          //delete utente.libri[index];
          utente.libri.push(newB.toString());
          found = true;
        }
      });
    }
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

  //restituisco la lista dei libri
  let lista = "";
  let utente = undefined;
  for (let i = 1; i < newId; i++) {
    utente = data.get(i);

    if (utente.name == name) {
      //ottengo tutti i libri su diverse righe
      lista = utente.libri.join("\n");
      break; //utente è l'utente cercato
    }
  }

  negoziaCodifica(lista, req, res, "libri");
});

//app listen
const listener = app.listen(process.env.PORT, () => {
  console.log("Listening on port" + listener.address().port);
});
