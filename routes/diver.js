const express = require("express"),
      router = express.Router(),
      bcrypt = require("bcrypt"),
      mysql = require('../dbcon.js'),
      helperFunc = require("../helperFunc"),
      multer = require('multer'),
      up = multer({ dest: 'uploads/' }),
      fs = require('fs'),
      AWS = require('aws-sdk'),
      dotenv = require('dotenv').config();

const ID = process.env.ID;
const secretKey = process.env.secretKey;
const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: secretKey
});

// Render page for editing diver information
router.get("/edit", helperFunc.isLoggedIn, (request, response) => {
    mysql.pool.query("SELECT * FROM Users WHERE username = ?", request.session.user_id, (error, rows, fields) => {
        if(error) {
            console.log(error)
        } else {
            response.render("diver/edit", {diver : rows[0]});
        }
    });
});

//put request execution for updating diver info
router.put("/edit", helperFunc.isLoggedIn, async (request, response) => {

    const {firstName, lastName, email, username, password, diverID} = request.body;
    const hashPassword = await bcrypt.hash(password, 12);

    const updatedUser = [username, hashPassword, firstName, lastName, email, parseInt(diverID)];
    mysql.pool.query("UPDATE Users SET username=?, password=?, firstName=?, lastName=?, email=? WHERE diverID=?", updatedUser, (error, result) => {
        if(error) {
            console.log(error)
        } else {
            response.redirect("/dives")
        }
    });
})

// Render page for listing certs
router.get("/certs", helperFunc.isLoggedIn, (request, response) => {

    mysql.pool.query("SELECT * FROM DiveCerts INNER JOIN Users ON DiveCerts.diverID = Users.diverID AND Users.username = ?", request.session.user_id, async (error, rows, fields) => {
        response.render("diver/listCerts", {certs:rows});
    });
});

// Render page for adding a new certification
router.get("/addCert", helperFunc.isLoggedIn, (request, response) => {
    response.render("diver/addCert");
    });


// Update database with new certification
router.post("/addCert", helperFunc.isLoggedIn, (request, response) => {
    const {certNum, description} = request.body;

    mysql.pool.query("SELECT diverID FROM Users WHERE username = ?", request.session.user_id, (error, rows, fields) => {
        if(error) {
            console.log(error)
        } else {
            const newCert = [certNum, rows[0].diverID, description];
            mysql.pool.query("INSERT INTO DiveCerts (certNum, diverID, description) VALUES(?, ?, ?)", newCert , (error, result) => {
                if(error) {
                    console.log(error);
                } else {
                    response.redirect("/diver/certs");
                }
            });
        }
    });
});

// Render page to edit certification for diver
router.post("/editCert", (request, response) => {
    mysql.pool.query("SELECT * FROM DiveCerts WHERE DiveCerts.certID = ?", request.body.certID, (error, rows, fields) => {
        if(error) {
            console.log(error)
        } else {
            response.render("diver/editCert", {diver : rows[0]});
        }
    });
});

// update page for edited certification for diver
router.put("/editCert", helperFunc.isLoggedIn, (request, response) => {
    const {certID, diverID, certNum, description } = request.body;
    const updatedCert = [certNum, description, parseInt(certID)];
    mysql.pool.query("UPDATE DiveCerts SET certNum=?, description=? WHERE certID=?", updatedCert, (error, result) => {
        if(error) {
            console.log(error)
        } else {
            response.redirect("/diver/certs")
        }
    });
})
// route to delete Cert
router.delete("/deleteCert", helperFunc.isLoggedIn, (request, response) => {
    mysql.pool.query(`DELETE FROM DiveCerts WHERE certID=?`, parseInt(request.body.certID), (error, result) => {
        if(error) {
            console.log(error)
        } else {
            response.redirect("/diver/certs")
        }
    });
})

// Render page for listing Diver's Images
router.get("/images", helperFunc.isLoggedIn, (request, response) => {

    mysql.pool.query(`SELECT * FROM Images 
                      INNER JOIN Users 
                      ON Images.diverID = Users.diverID
                      WHERE Images.diveID IS NULL AND Users.username = ?`, request.session.user_id, async (error, rows, fields) => {
                        response.render("diver/listImages", {images:rows});
    });
});

// Render page for adding a new Diver Image
router.get("/addImage", helperFunc.isLoggedIn, (request, response) => {
    response.render("diver/addImage");
    });

// Update database with new a new Diver Image

router.post("/addImage", helperFunc.isLoggedIn, up.single('image'), (request, response) => {
    const newImage = {};
    console.log(request.session.user_id)
    mysql.pool.query(`SELECT diverID                        
                      FROM Users 
                      WHERE username = ?`, 
                      request.session.user_id, (error, rows, fields) => {
        if(error) {
            console.log(error)
        } else {
            console.log(rows)
            newImage.diveID = null
            newImage.diverID = rows[0].diverID
            newImage.description = request.body.description
            const queryData = Object.values(newImage)

            const BUCKET_NAME = 'divetastic-images';
            const FILE_NAME = request.file.filename;

            const uploadFile = async (fileName) => {
                const fileContent = fs.readFileSync(fileName);
                const params = {
                        Bucket: BUCKET_NAME,
                        Key: FILE_NAME + request.file.originalname.match(/\.[0-9a-z]+$/i)[0],
                        Body: fileContent
                    };

                s3.upload(params, async function (err, data) {
                    if (err) {
                        throw err;
                    }
                    queryData.push(data.Location)
                    await mysql.pool.query(`INSERT INTO Images 
                                           (diveID, diverID, description, imageURL) 
                                           VALUES(?, ?, ?, ?)`, 
                                           queryData, async (error, result) => {
                        if (error) {
                            console.log(error);
                        } else {
                            fs.unlinkSync('uploads/' + request.file.filename);
                            response.redirect("/diver/images");
                        }
                    });
                });
            }
        uploadFile('uploads/' + request.file.filename);
        }
    });
});

// Render page to edit a Diver Image
router.post("/editImage", (request, response) => {
    mysql.pool.query("SELECT * FROM Images WHERE Images.imageID = ?", request.body.imageID, (error, rows, fields) => {
        if(error) {
            console.log(error)
        } else {
            response.render("diver/editImage", {image : rows[0]});
        }
    });
});

// Update page to edit a Diver Image
router.put("/editImage", helperFunc.isLoggedIn, up.single('image'), (request, response) => {
    const BUCKET_NAME = 'divetastic-images';
    if (typeof request.file !== "undefined") {
        const FILE_NAME = request.file.filename;

        const uploadFile = async (fileName) => {
            const fileContent = fs.readFileSync(fileName);
            const params = {
                Bucket: BUCKET_NAME,
                Key: FILE_NAME + request.file.originalname.match(/\.[0-9a-z]+$/i)[0],
                Body: fileContent
            };

            s3.upload(params, async function (err, data) {
                if (err) {
                    throw err;
                }
                var newURL = (data.Location)
                await mysql.pool.query(
                    'UPDATE Images SET description=?, imageURL=? WHERE imageID=?',
                    [request.body.description, newURL, request.body.imageID],
                    (error, result) => {
                        if (error) {
                            console.log(error);
                        } else {
                            fs.unlinkSync('uploads/' + request.file.filename);
                            response.redirect('/diver/images')
                        }
                    }
                );
            });

        }

        uploadFile('uploads/' + request.file.filename);
    }
    else {
        mysql.pool.query(
            'UPDATE Images SET description=? WHERE imageID=?',
            [request.body.description, request.body.imageID],
            (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    response.redirect('/diver/images')
                }
            }
        );
    }

});

// route to delete diver image
router.delete("/deleteImage", helperFunc.isLoggedIn, (request, response) => {
    mysql.pool.query(`DELETE FROM Images WHERE imageID=?`, parseInt(request.body.imageID), (error, result) => {
        if(error) {
            console.log(error)
        } else {
            response.redirect("/diver/images")
        }
    });
})

module.exports = router;