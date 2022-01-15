// Route file for all of the user and "main" routes on the page

const express = require("express"),
router = express.Router();

// Main landing page
router.get("/", (request, response) => {
    response.render('landing');
});

// Render page for registering for website
router.get("/register", (request, response) => {
    response.render("loginregister/register");
});

// Update database with new registered diver
router.post("/register", async (request, response) => {
    const {firstName, lastName, email, username, password} = request.body;
    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = [username, hashPassword, firstName, lastName, email];
});

// Login for existing user
router.get("/login", (request, response) => {
    response.render("loginregister/login", {referer:request.headers.referer});
});

// POST route to execute login
router.post("/login", (request, response) => {
    const {username, password} = request.body;
}); 

// logout user
router.get("/logout", (request, response) => {
    request.session.user_id = null;
    response.redirect("/");
});    
        
module.exports = router;