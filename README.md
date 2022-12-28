# Progetto PDGT a.a. 2020/2021
Nome, Cognome e Matricola: Matteo Marco Montanari 299166
## Biblioteca online
Progetto per l'esame di Piattaforme Digitali per la Gestione del Territorio, sessione autunnale, a.a. 2020/2021  
Created by Montanari Matteo Marco, 299166

## Descrizione del servizio
Il servizio implementato permette la raccolta di informazioni gestionali, 
accessibili online, per la gestione di una biblioteca disponibile 
per un numero arbitrario di utenti. Ogni utente che si registra al servizio ottiene 
la possiblità di registrare una lista dei propri libri, che potrà essere modificata 
in ogni momento come anche l'iscrizione al servizio stesso. Quest'ultima
è effettuata tramite login e password.

## Scelte implementative
Il servizio è sviluppato tramite la tecnologia nodejs che permette di sfruttare 
Javascript per la programmazione lato server.   
I package utilizzati per l'implementazione sono: express, njwt,
js-sha256 e cookie-parser (scaricati tramite npm).  
Il testing del servizio è stato effettuato tramite postman.com sfruttando l'API HTTP.

## API per comunicare con il servizio
Endpoint e verbi HTTP supportati dal servizio (di seguito 'richieste'):  
1. GET     /  
Accedi alla root del servizio.
2. GET     /utenti/:name/secret/jwt  
Ottieni il messaggio segreto relativo all'utente di cui possiedi il JWT firmato.  
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
Ottieni il cookie di sessione (JWT firmato) tramite Basic authentication una volta registrato.
9. POST    /utenti/:name/libri/rename/:old/:new  
Sostituisci un libro (old) con un altro (new).
10. DELETE  /utenti/remove/:name  
Rimuovi l'utente specificato se possiedi il suo JWT firmato.
11. DELETE  /utenti/:name/libri/remove/:lib  
Rimuovi un libro di un utente registrato.

URL base: https://fuchsia-outstanding-plow.glitch.me

NOTA BENE: Non è possibile effettuare le operazioni di cui ai punti nn. 2, 5, 7, 9, 10, 11
se non si possiede il JWT valido dell'utente in questione (ottenibile come al punto n.8).

## Messa online del servizio
Il servizio è stato sviluppato e risiede come servizio pubblico su glitch.com

## Esempio di utilizzo del servizio
Esempio che mostra il funzionamento del servizio: 
1. Verificare la messa online del servizio tramite la richiesta n.1.  
(es. GET /)
2. Registrare un nuovo utente con la richista n. 6.  
(es. PUT     /utenti/register/mario/passwordDiMario)
3. Verificare che l'utente sia registrato tramite la richiesta n.4.  
(es. GET     /utenti/mario)
4. Ottenere il cookie di sessione relativo all'utente tramite la richiesta n.8.  
( es. POST    /utenti/login/jwt con header Authorization: Basic mario:passwordDiMario)
5. Ottenere il documento segreto per verificare il funzionamento del cookie con la
richiesta n.2.  
(es. GET     /utenti/mario/secret/jwt)
6. Inserire un libro ad un utente tramite la richiesta n.7.  
(es. PUT     /utenti/mario/libri/add/1984)
7. Visualizzare i libri dell'utente tramite la richiesta n.5. E' possibile utilizzare l'header 
Accept per la negoziazione della codifica e ottenere la lista dei libri in formato JSON o HTML.  
(es. GET     /utenti/mario/libri)
8. Rinominare un libro di un utente tramite la richiesta n.9.  
(es. POST    /utenti/mario/libri/rename/1984/eragon)
9. Verificare il risultato ripetendo il passo n.7 di questa sezione.
10. Eliminare un libro dalla raccolta dell'utente tramite la richiesta n.11.  
(es. DELETE  /utenti/mario/libri/remove/eragon)
11. Verificare il risultato ripetendo il passo n.7 di questa sezione.
12. Eliminare un utente registrato tramite la richiesta n.10.  
(es. DELETE  /utenti/remove/mario)
13. Verificare il risultato, mostrando la lista di tutti gli utenti registrati, tramite
la richiesta n.3.  
(es. GET     /utenti )  

NOTA BENE: Dopo aver ottenuto il JWT esso ha una scadenza di 60 secondi dopodiché 
è necessario ottenerne un altro tramite la richiesta n.8.

## Note finali
Aggiunta dello script per gestire le politiche CORS (cross-origin resource sharing) ripreso da https://stackoverflow.com/questions/65630743/how-to-solve-flutter-web-api-cors-error-only-with-dart-code/66879350#66879350 per risolvere errori di connessione all'API del servizio per applicazione flutter scritta in dart. 

### Termine della relazione
