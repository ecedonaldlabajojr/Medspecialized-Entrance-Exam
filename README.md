# Medspecialized-Entrance-Exam
MedSpecialized (Back-End Developer) Coding Exam using Node.js and MongoDB

## [Technologies](#Technologies) <br>
## [Features](#Features) <br>
## [Set-Up](#Set-Up) <br>


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
- [x] User login by email and password, authenticating account credentials via reading from ***MongoDB Atlas*** database collection.
- [x] Admin role: able to perform CRUD (Create-Read-Update-Delete) user accounts. This feature is only available to "Admin", and is hidden to "Trainee". Please use the ***"Admin" button*** with dropdown options.

**This web app doesn't support the following as of the moment:**
- Login via ***Gmail or MEM*** is currently unavailable.
- ***Forgot password*** is currently unavailable.


# Set-Up
**Note: The website already fetches user data from a database I have deployed on ***MongoDB Atlas***. Please ensure internet connectivity.** <br><br>
**Please use these credentials to login on both local and deployed website.** <br>
### Admin:
***username: admin@gmail.com*** <br>
***password: 12345***

### Trainee:
***username: trainee_01@gmail.com*** <br>
***password: 12345***

There are **two ways** of testing the website:
1. To test out deployed site(***Hosted on Heroku***),input this URL on your browser:
```
https://medspecialized-exam.herokuapp.com/login
```
2. To test out locally, see below:

***Please ensure the following are already installed on your computer:***
- [x] node.js and NPM(Node Package Manager)
- [x] Text Editor/IDE (for viewing the code)

Kindly follow these steps:
1. Download the zip file from this repository.
2. Extract to a working directory of your choice.
3. CD to said directory.
4. On the command line, install dependencies:
``` node
npm install
```
Then proceed to run the app:
```node
node app.js
```
Then input this URL on your browser:
```
http://localhost:3000/
```
