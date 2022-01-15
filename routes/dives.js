//  Divetastic routes that start with /dives/

const { request } = require('express');

const express = require('express'),
    router = express.Router(),
    helperFunc = require('../helperFunc'),
    mysql = require('../dbcon.js');

// Route to show all of the Dives.  Orderd by Newest date first
router.get('/', helperFunc.isLoggedIn, (request, response) => {
    mysql.pool.query(
        `SELECT * FROM Dives 
                        JOIN Users ON Dives.diverID = Users.diverID 
                        JOIN AllDiveLocs ON Dives.locationID = AllDiveLocs.locationID 
                        WHERE Users.username = ?
                        ORDER BY Dives.date DESC`,
        request.session.user_id,
        (error, rows, fields) => {
            if(error) {
                console.log(error)
            } else {
                let locationIDs = {}
                for (let row of rows) {
                    row.date = row.date.toString().slice(0, 16);
                    locationIDs[row.locationID] = row.name
                }
                response.render('dives/dives', { dives: rows, locations: locationIDs});
            }

        }
    );
});

// API route to pull data and return for client based search for dives by location
router.post('/search', helperFunc.isLoggedIn, (request, response) => {
    const { locationID } = request.body;
    if (locationID === '*') {
        mysql.pool.query(
            `SELECT * FROM Dives 
        JOIN Users ON Dives.diverID = Users.diverID 
        JOIN AllDiveLocs ON Dives.locationID = AllDiveLocs.locationID 
        WHERE Users.username = ?`,
            request.session.user_id,
            async (error, rows, fields) => {
                response.send(rows);
            }
        );
    } else {
        let searchDives = [request.session.user_id, locationID];
        mysql.pool.query(
            `SELECT * FROM Dives 
                            JOIN Users ON Dives.diverID = Users.diverID 
                            JOIN AllDiveLocs ON Dives.locationID = AllDiveLocs.locationID 
                            WHERE Users.username = ? AND Dives.locationID = ?`,
            searchDives,
            async (error, rows, fields) => {
                response.send(rows);
            }
        );
    }
});

// Render page to view a specific dive's details
router.post('/details', helperFunc.isLoggedIn, (request, response) => {
    if (typeof request.body.diveID == "undefined") {
        request.body.diveID = request.session.diveID
    }
    mysql.pool.query(
        'SELECT * FROM Dives JOIN AllDiveLocs USING(locationID) WHERE diveID = ?',
        request.body.diveID,
        (error, rows, fields) => {
            if (error) {
                console.log(error);
            } else {
                let month = rows[0].date.getMonth() + 1;
                if (month < 10) {
                    month = `0${month}`;
                } else {
                    month = `${month}`;
                }
                let day = rows[0].date.getDate();
                if (day < 10) {
                    day = `0${day}`;
                } else {
                    day = `${day}`;
                }
                rows[0].date = `${rows[0].date.getFullYear()}-${month}-${day}`;

                mysql.pool.query(
                    'SELECT * FROM Images WHERE diveID = ?',
                    request.body.diveID,
                    (error, rowImages, field) => {
                        if (error) {
                            console.log(error);
                        } else {
                            rows[0].images = rowImages;
                            mysql.pool.query(
                                'SELECT * FROM IndLocFeatures JOIN LocFeatures ON IndLocFeatures.featureID = LocFeatures.featureID AND IndLocFeatures.locationID = ?',
                                parseInt(rows[0].locationID),
                                (error, rowFeatures, field) => {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        rows[0].features = rowFeatures;
                                        mysql.pool.query(
                                            'SELECT * FROM AllTheFish JOIN IndFishSeen ON AllTheFish.fishID = IndFishSeen.fishID AND IndFishSeen.diveID = ?',
                                            request.body.diveID,
                                            (error, rowFish, field) => {
                                                if (error) {
                                                    console.log(error);
                                                } else {
                                                    rows[0].fish = rowFish;
                                                    response.render('dives/showDetail', { dive: rows[0] });
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    }
                );
            }
        }
    );
});

// route to display the new dive form
router.get('/new', helperFunc.isLoggedIn, (request, response) => {
    mysql.pool.query('SELECT * FROM AllDiveLocs', (error, rows, fields) => {
        if (error) {
            console.log(error);
        } else {
            response.render('dives/newDive', { locations: rows });
        }
    });
});

// Update database with new Dive
router.post('/new', helperFunc.isLoggedIn, (request, response) => {
    const { date, locationID, timeDuration, visibility, temperature } = request.body;
    mysql.pool.query('SELECT diverID FROM Users WHERE username = ?', request.session.user_id, (error, rows, fields) => {
        if (error) {
            console.log(error);
        } else {
            const newDive = [
                date,
                parseInt(locationID),
                parseInt(timeDuration),
                visibility,
                parseInt(temperature),
                rows[0].diverID
            ];
            mysql.pool.query(
                'INSERT INTO Dives (date, locationID, timeDuration, visibility, temp, diverID) VALUES(?, ?, ?, ?, ?, ?)',
                newDive,
                (error, result) => {
                    if (error) {
                        console.log(error);
                    } else {
                        newDiveID = { diveID: result.insertId };
                        userID = { diverID: newDive[5] };
                        response.render('images/newImage', { diverID: userID, diveID: newDiveID });
                    }
                }
            );
        }
    });
});

// route to delete a Dive
router.delete('/deleteDive', helperFunc.isLoggedIn, (request, response) => {
    mysql.pool.query(`DELETE FROM Dives WHERE diveID=?`, parseInt(request.body.diveID), (error, result) => {
        if (error) {
            console.log(error);
        } else {
            response.redirect('/dives');
        }
    });
});

// Render page to edit text of a dive
router.post('/edit', helperFunc.isLoggedIn, (request, response) => {
    mysql.pool.query(
        'SELECT AllDiveLocs.locationID, name, diveID, date, temp, visibility, timeDuration, diverID FROM AllDiveLocs LEFT JOIN Dives ON AllDiveLocs.locationID = Dives.locationID AND Dives.diveID = ? ORDER BY Dives.diveID DESC',
        parseInt(request.body.diveID),
        (error, rows, fields) => {
            if (error) {
                console.log(error);
            } else {
                for (item of rows) {
                    if (item.date) {
                        let month = item.date.getMonth() + 1;
                        if (month < 10) {
                            month = `0${month}`;
                        } else {
                            month = `${month}`;
                        }
                        let day = item.date.getDate();
                        if (day < 10) {
                            day = `0${day}`;
                        } else {
                            day = `${day}`;
                        }
                        item.date = `${item.date.getFullYear()}-${month}-${day}`;
                    }
                }
                response.render('dives/edit', { dive: rows });
            }
        }
    );
});

// update page for edited dive for
router.put('/edit', helperFunc.isLoggedIn, (request, response) => {
    const { date, locationID, timeDuration, visibility, temp, diverID, diveID } = request.body;
    const updatedDive = [
        date,
        locationID,
        parseInt(timeDuration),
        visibility,
        parseInt(temp),
        parseInt(diverID),
        parseInt(diveID)
    ];
    mysql.pool.query(
        'UPDATE Dives SET date=?, locationID=?, timeDuration=?, visibility=?, temp=?, diverID=? WHERE diveID=?',
        updatedDive,
        (error, result) => {
            if (error) {
                console.log(error);
            } else {
                response.redirect('/dives');
            }
        }
    );
});

// route to display all the fish for a dive that aren't already selected for that dive
router.post('/addMoreFish', (request, response) => {
    const newDiveID = { diveID: request.body.diveID };
    mysql.pool.query(`SELECT AllTheFish.fishID, AllTheFish.commonName, AllTheFish.imageURL, IndFishSeen.diveID
                      FROM AllTheFish
                      LEFT JOIN IndFishSeen 
                      ON AllTheFish.fishID = IndFishSeen.fishID
                      AND IndFishSeen.diveID = ?
                      WHERE IndFishSeen.diveID IS NULL`, 
                      parseInt(request.body.diveID), (error, rows, fields) => {
        response.render('dives/addFish', { fish: rows, diveID: newDiveID });
    });
});

// route to add the fish to the database that are selected
router.post('/addFish', helperFunc.isLoggedIn, (request, response) => {
    request.session.diveID = request.body.diveID
    const newFishes = { ...request.body };
    console.log(newFishes)
    delete newFishes.diveID;
    const diveID = request.body.diveID;
    let promises = [];
    for (const newFish in newFishes) {
        promises.push(writeIndFish(diveID, newFish));
    }

    Promise.all(promises).then(() => {
        response.redirect(307, '/dives/details');
    });

    function writeIndFish(diveID, newFish) {
        return new Promise((resolve) => {
            const newIndFish = [parseInt(diveID), parseInt(newFish)];
            mysql.pool.query('INSERT INTO IndFishSeen (diveID, fishID) VALUES(?, ?)', newIndFish, (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    resolve();
                }
            });
        });
    }
});

// route to delete fish from a dive
router.delete('/deleteFish', helperFunc.isLoggedIn, (request, response) => {
    request.session.diveID = request.body.diveID
    mysql.pool.query(
        `DELETE FROM IndFishSeen WHERE diveFishID=?`,
        parseInt(request.body.diveFishID),
        (error, result) => {
            if (error) {
                console.log(error);
            } else {
                response.redirect(307, '/dives/details');
            }
        }
    );
});

// route to edit an image on a dive
router.post('/editImage', helperFunc.isLoggedIn, (request, response) => {
    mysql.pool.query('SELECT * FROM Images WHERE imageID = ?', request.body.imageID, (error, rows, fields) => {
        if (error) {
            console.log(error);
        } else {
            response.render('images/edit', { image: rows[0] });
        }
    });
});

module.exports = router;
