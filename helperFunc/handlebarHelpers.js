// All the handlebar helpers for Divetastic.  

handlebars = require("express-handlebars");

let hbs = handlebars.create({})

hbs.handlebars.registerHelper('isAuthor', (author, currentUser) => {
  return (currentUser && currentUser.username === author.username) || (currentUser && currentUser.username == "admin")
});

hbs.handlebars.registerHelper('increment', (index) => {
  return index + 1
});

hbs.handlebars.registerHelper('isAdmin', (currentUser) => {
  return currentUser && currentUser.username === "admin" 
});

module.exports=hbs;


