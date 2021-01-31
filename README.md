# Medspecialized-Entrance-Exam
MedSpecialized (Back-End Developer) Coding Exam using Node.js and MongoDB

## [Technologies](#Technologies) <br>
## [Features](#Features) <br>
## [Set-Up](#Set-Up) <br>
## [Testing](#Testing) <br>


# Technologies
This web app uses the following technologies / languages:
* CSS3, HTML5
* Bootstrap4
* Javascript, JQuery
* MongoDB using Mongoose - Database is hosted on ***MongoDB Atlas***
* EJS templating Engine
* Node.js using Express.js framework, incorporating various middleware packages such as:
  - Passport.js for user Authentication(using Local Strategy)
  - Express-session for handling Sessions
  - Express-validator for form-validation
  - etc.
  
# Features

**This web app has the following features:**
- [x] User login by email and password by authenticating account credentials via reading from MongoDB users collection from ***MongoDB Atlas*** cloud.
- [x] Admin role: able to perform CRUD (Create-Read-Update-Delete) user accounts. This feature is only available to "Admin", and is hidden to "Trainee".

**This web app doesn't support the following as of the moment:**
- Login via ***Gmail or MEM*** is currently unavailable.
- ***Forgot password*** is currently unavailable.


# Set-Up/Testing
***Please ensure the following are already installed on your computer:***
- [x] node.js
- [x] Text Editor/IDE
- [x] MongoDB Server (Should you want to test the app locally)

Kindly follow these steps:
1. Download the zip file from this repository.
2. Extract to a working directory of your choice.
3. CD to said directory.
4. On the command line, run:
```node
node app.js
```


# Testing
**Please use these credentials to login (Admin) on both local and deployed website** <br>
***username: admin@gmail.com*** <br>
***password: 11111***


- For testing locally: please do the following:
To run the site, input this URL on your browser:
```
http://localhost:3000/login
```
***Please note: The website already fetches data from database hosted on MongoDB Atlas. Please ensure internet connection***

- For testing on deployed website, input this URL on your browser:
```
https://medspecialized-exam.herokuapp.com/login
```
