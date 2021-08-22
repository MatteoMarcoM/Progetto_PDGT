const express = require("express");
const app = express();

//JSON?
//app.use(express.json);

//mappa javascript (id, {dizionario chiave valore})
let data = new Map();
data.set(1, { name: 'Mario', libri: ['libro1', 'libro2'] } );
let newId = 2;  // id incrementale nuovo utente

//reset mappa
data = new Map();
newId = 1;

app.get("/", (req, res) => {
  console.log("Access to root");
  res.sendStatus(200);  //OK
});

//registra gli utenti
//PUT?
app.post("/register/:name", (req, res) => {
  const n = req.params.name;
  
  //aggiungo nuovo utente senza libri
  data.set(newId, {name: n, libri: []});
  newId++;
  
  res.sendStatus(200);
  console.log("User successfully registered: "+n);
});

function foundUser(name){
  let found = false;
  
  //ciclo sugli id esistenti e ottengo il nome dai
  // vari dizionari, da confrontare con name
  for(let i=1; i< newId; i++){
    if(data.get(i).name == name){
      found = true;
    }
  }
  return found;
}

//NNB
//deregistra utente
app.delete('utenti/remove/:name', (req, res) =>{
  
  for(let id=1; id< newId; id++){
    let utente = data.get(id);
    
    if(utente.name == name){
      //data.delete(id);
      //newId--;
      data.get(id).name = '';
      //altrimenti il valore id viene eliminato e
      //la mappa rimane male indicizzata
    }
  }
});

//endpoint per la lista degli utenti registrati
app.get('/utenti', (req, res) =>{
  
  let lista = '';
  for(let i=1; i< newId; i++){
    lista += data.get(i).name;
    }
  
  res.type('text/html').send("<html>Lista utenti:\n"+lista+'</html>');
});

//accedi all'endpoint degli utenti
app.get("/utenti/:name", (req, res) =>{
  const n = req.params.name;
  
  if(foundUser(n) == false){
    res.sendStatus(404); //not found
    return;
  }
  
  //found
  res.type('text/plain').send("Biblioteca personale di "+n);
});

//endpoint per aggiungiere un libro
app.put("/utenti/:name/libri/:libro", (req, res) =>{
  const name = req.params.name;
  const libro = req.params.libro;
  
  if(foundUser(name) == false){
    res.sendStatus(404); //not found
    return;
  }
  
  //aggiungo il libro
  for(let i=1; i< newId; i++){
    let utente = data.get(i);
    
    if( utente.name == name){
      utente.libri.push(libro);
    }
  }
  
  res.sendStatus(200);
  console.log("Aggiunto libro: "+libro+" a utente: "+name);
});


//endpoint per rimuovere un libro
app.delete("/utenti/:name/libri/remove/:lib", (req, res) =>{
  const name = req.params.name;
  const libro = req.params.lib;
  
  if(foundUser(name) == false){
    res.sendStatus(404); //not found
    return;
  }
  
  //trovo l'utente
  for(let i=1; i< newId; i++){
    let utente = data.get(i);
    
    if( utente.name == name){
      //rimuovo il libro dell'utente
      
      //CHIEDERE PROF PERCHé NON FA COL FOR
      
      /*for(let j=0; j<utente.libri.lenght; j++){
        if(utente.libri[j] == libro)
          delete utente.libri[j];
      }*/
      utente.libri.forEach(function(item, index, array) {
        console.log(item, index);
        if(utente.libri[index] == libro)
          delete utente.libri[index];
      });
    }
  }
  
  res.sendStatus(200);
  console.log("Rimosso il libro: "+libro+" a utente: "+name);
});

//endpoint per ottenere la lista dei libri
app.get('/utenti/:name/libri', (req, res) =>{
  let name = req.params.name;
  
  if(!foundUser(name)){
    console.log("User "+name+" not found");
    res.sendStatus(404); //not found
    return;
  }
  
  //restituisco la lista dei libri
  let lista = '';
  for(let i=1; i< newId; i++){
    let utente = data.get(i);
    
    if( utente.name == name){
      //ottengo tutti i libri su diverse righe
      lista = utente.libri.join('\n');
    }
  }
  
  res.type('text/html').send("<html>Lista libri:\n"+lista+'</html>');
});

//app listen
const listener = app.listen(process.env.PORT, () => {
  console.log("Listening on port" + listener.address().port);
});