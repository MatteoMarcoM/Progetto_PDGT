# Progetto PDGT 2020/2021
Nome, Cognome e Matricola: Matteo Marco Montanari 299166
## Biblioteca online
Progetto per esame di PDGT sessione autunnale 2020/2021  
Created by Montanari Matteo Marco, 299166

## Descrizione del servizio
Il servizio implementato permette la raccolta di infomazioni gestionali per una biblioteca 
accessibili online e disponibili per un numero arbitrario di utenti. Ogni utente che si
registra al servizio ottiene la possiblità di registrare una lista dei propri libri che
potrà essere modificata in ogni momento come anche l'iscrizione al servizio. Quest'ultima
è effettuata tramite login e password.

## Scelte implementative
Il servizio è sviluppato tramite la tecnologia nodejs che permette di sfruttare 
Javascript per la programmazione lato server.   
I package utilizzati per l'implementazione sono: express, njwt,
js-sha256 e cookie-parser (scaricati tramite npm).  
Il testing del servizio è stato effettuato tramite postman.com sfruttando l'API HTTP.

## API per comunicare con il servizio
1. GET     /  
Accedi alla root del servizio.
2. GET     /utenti/:name/secret/jwt  
Ottieni il messaggio segreto relativo all'utente di cui possiedi il jwt firmato.  
3. GET     /utenti  
Ottieni la lista di utenti.
4. GET     /utenti/:name    
Ottieni un messaggio se l'utente è registrato.
5. GET     /utenti/:name/libri	  
Ottieni la lista dei libri dell'utente specificato se precedentemente registrato.
6. PUT     /utenti/register/:name/:password  
Registra un utente con username e relativa password (se non gia' presente).
7. PUT     /utenti/:name/libri/add/:libro  
Aggiungi un libro alla raccolta dell'utente.
8. POST    /utenti/login/jwt  
Ottieni il cookie di sessione tramite Basic authentication una volta registrato.
9. POST    /utenti/:name/libri/rename/:old/:new  
Sostituisci un libro (old) con un altro (new).
10. DELETE  /utenti/remove/:name  
Rimuovi un utente registrato.
11. DELETE  /utenti/:name/libri/remove/:lib  
Rimuovi un libro di un utente registrato.

URL base: https://fuchsia-outstanding-plow.glitch.me

## Messa online del servizio
Il servizio è stato sviluppato e risiede come servizio pubblico su glitch.com

## Esempio di utilizzo del servizio