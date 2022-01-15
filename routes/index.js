// Route file for all of the user and "main" routes on the page

const express = require("express"),
      router = express.Router();
      
    // Main landing page
    router.get("/", (request, response) => {
        response.render('landing');
        });
    
    // display page about author
    router.get("/about", (request, response) => {
        response.render('about');
        });

    // display page about other related websites
    router.get("/links", (request, response) => {
        response.render('links');
        });
        
module.exports = router;