# Progetto PDGT 2020/2021 biblioteca online
Progetto per esame di PDGT sessione autunnale 2020/2021  
Created by Montanari Matteo Marco

## API per comunicare con il servizio
1. GET     /			  
2. GET     /utenti/:name/secret/jwt	  		
3. GET     /utenti			  
4. GET     /utenti/:name  
5. GET     /utenti/:name/libri	  		
6. PUT     /utenti/register/:name/:password			  
7. PUT     /utenti/:name/libri/add/:libro			  
8. POST    /utenti/login/jwt			  
9. POST    /utenti/:name/libri/rename/:old/:new	  		
10. DELETE  /utenti/remove/:name			  
11. DELETE  /utenti/:name/libri/remove/:lib		  	

URL base: https://fuchsia-outstanding-plow.glitch.me