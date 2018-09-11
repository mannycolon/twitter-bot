## Docker setup with heroku 
 - docker build -t mannycolon/twitter-bot .
 - heroku container:login
 - heroku container:push worker
 - heroku logs