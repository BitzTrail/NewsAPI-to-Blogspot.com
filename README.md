# NewsAPI-to-Blogspot.com
A google app script to post articles from newsapi.org to blogspot.com 
This is a reversed script of News api to slack and sheet to blogger 
Need Further development in terms of full article retrieval using readability.js > 
trigger need to run with out authentications then only it will run continuously: righ now it needs to open the auth link after some time :
Avoiding duplication of post : 

what is capable right now post articles to blogger with  featured  image and small description 
I am not a coder so implementing features is bit hard for me ; 


How to Use 

Goto script.google.com
create new project and replace code.gs with the codes these any .gs files 
there are two versions one is script app version which usually run for the trigger without authentication 
another one is oauth version which requires client id and client secret you need to create that from the project 
replace your blog id and newsapi api codes 
add appscript manifest details as well .
run post to blog function and check log as well .
