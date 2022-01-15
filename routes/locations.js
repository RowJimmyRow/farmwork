const express = require("express"),
    router = express.Router(),
    mysql = require('../dbcon.js'),
    helperFunc = require("../helperFunc");

// Location Database landing page
router.get("/", (request, response) => {
    mysql.pool.query("SELECT * FROM AllDiveLocs", (error, rows) => {
        if (error) {
            console.log(error)
        } else {
            let promises = [];
            let newList = []

            for (let row of rows) {
                promises.push(writeIndFeatures(row))
            }

            Promise.all(promises).then(() => {
                response.render("locations/location", { locations: newList });
            });
            
            function writeIndFeatures(row) {
                return new Promise((resolve) => {
                    mysql.pool.query(`SELECT * FROM IndLocFeatures 
                                      JOIN LocFeatures USING(featureID) 
                                      WHERE IndLocFeatures.locationID = ?`, 
                                      parseInt(row.locationID), (error, rowFeatures) => {
                            if (error) {
                                console.log(error)
                            } else {
                                row.features = rowFeatures
                                newList.push(row)
                                resolve()
                            }
                    });
                })    
            }
        }
    });
});

// Location add page
router.get("/new", helperFunc.isLoggedIn, (request, response) => {
    response.render("locations/locationAdd");
});

// Add new location POST route
router.post("/new", helperFunc.isLoggedIn, async (request, response) => {
    const { name, locCity, locState, locCountry, description } = request.body;
    const newLoc = [name, locCity, locState, locCountry, description];
    mysql.pool.query(`INSERT INTO AllDiveLocs 
                      (name, locCity, locState, locCountry, description) 
                      VALUES(?, ?, ?, ?, ?)`, 
                      newLoc, async (error, result) => {
        if (error) {
            console.log(error);
        } else {
            mysql.pool.query("SELECT * FROM LocFeatures", async (error, rows, fields) => {
                newLocationID = { locationID: result.insertId }
                response.render("locations/addFeature", { features: rows, locationID: newLocationID });
            });
        }
    });
});

// Render page to edit the text of a location
router.post("/edit", helperFunc.isLoggedIn, (request, response) => {
    mysql.pool.query(`SELECT * FROM AllDiveLocs WHERE locationID = ?`, 
                     request.body.locationID, (error, rows, fields) => {
        if (error) {
            console.log(error)
        } else {
            response.render("locations/locationEdit", { location: rows[0] });
        }
    });
});

// update page for editing a location
router.put("/edit", helperFunc.isLoggedIn, (request, response) => {
    const { name, locCity, locState, locCountry, description, locationID } = request.body;
    const updatedLocation = [name, locCity, locState, locCountry, description, parseInt(locationID)];
    mysql.pool.query(`UPDATE AllDiveLocs 
                      SET name=?, locCity=?, locState=?, locCountry=?, description=? 
                      WHERE locationID=?`, 
                      updatedLocation, (error, result) => {
        if (error) {
            console.log(error)
        } else {
            response.redirect("/locations")
        }
    });
})

// Feature Database landing page
router.post("/addMoreFeature", (request, response) => {
    const newLocationID = { locationID: request.body.locationID }
    mysql.pool.query(`SELECT LocFeatures.featureID, LocFeatures.locFeatureName, LocFeatures.featureURL, IndLocFeatures.locationID
                    FROM LocFeatures 
                    LEFT JOIN IndLocFeatures 
                    ON LocFeatures.featureID = IndLocFeatures.featureID
                    AND IndLocFeatures.locationID = ? 
                    WHERE IndLocFeatures.locationID IS NULL
                    `, parseInt(request.body.locationID), (error, rows, fields) => {
        response.render("locations/addFeature", { features: rows, locationID: newLocationID });
    });
});

router.post("/addFeature", helperFunc.isLoggedIn, (request, response) => {
    const newFeatures = { ...request.body }
    const { locationID } = request.body
    delete newFeatures.locationID;
    let promises = [];
    for (const newFeature in newFeatures) {
        promises.push(writeIndFeatures(locationID, newFeature))

    }

    Promise.all(promises).then(() => {
        response.redirect("/locations");
    });

    function writeIndFeatures(locationID, newFeature) {
        return new Promise((resolve) => {
            const newLocFeature = [parseInt(locationID), parseInt(newFeature)];
            mysql.pool.query(`INSERT INTO IndLocFeatures 
                             (locationID, featureID) VALUES(?, ?)`, 
                             newLocFeature, (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    resolve();
                }
            })
        })
    };
});

// route to delete a Dive
router.delete("/deleteFeature", helperFunc.isLoggedIn, (request, response) => {
    mysql.pool.query(`DELETE FROM IndLocFeatures WHERE indLocFeatID=?`,
                     parseInt(request.body.indLocFeatID), (error, result) => {
        if (error) {
            console.log(error)
        } else {
            response.redirect("/locations")
        }
    });
})

module.exports = router;