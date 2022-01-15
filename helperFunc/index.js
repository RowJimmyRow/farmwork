// middleware helper functions for passport to check logins

let middlewareObj = {};

// Check to see if someone in generically logged in
middlewareObj.isLoggedIn = (request, response, next) => {
    if(request.session.user_id) {
        return next();
    }
    response.redirect("/diver/login");
};

// Check to see if the person logged in is the Admin
middlewareObj.isAdmin = (request, response, next) => {
    if(request.session.user_id === "admin") {
        return next();
    }
    response.redirect("/dives");
};

// // Check to see if the person logged in is the owner of the dive
// middlewareObj.checkHikesOwnership = (request, response, next) => {
//         if(request.isAuthenticated()) {
//             Hikes.findById(request.params.id, (error, foundHike) => {
//                  if(error) {
//                      response.redirect("back");
//                    } else {
//                          if(foundHike.author.id.equals(request.user._id) || request.user.username === "admin") {
//                             next(); 
//                         } else {
//                                  response.redirect("back");
//                              }
//                        }
//                    });
//                 } else {
//                     response.redirect("back");
//                     }
//                 }

// // Check to see if the person logged in is the owner of the image
// middlewareObj.checkImageOwnership = (request, response, next) => {
//     if(request.isAuthenticated()) {
//         Image.findById(request.params.id, (error, foundImage) => {
//                 if(error) {
//                     response.redirect("back");
//                 } else {
//                         if(foundImage.author.id.equals(request.user._id)) {
//                         next(); 
//                     } else {
//                                 response.redirect("back");
//                             }
//                     }
//                 });
//             } else {
//                 response.redirect("back");
//                 }
//             }

module.exports=middlewareObj
