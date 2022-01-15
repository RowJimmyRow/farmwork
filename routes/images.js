const express = require("express"),
    router = express.Router(),
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


// Display all images with associated dive
router.get("/", (request, response) => {
    response.render("images/showImages");

});

// // Display form to add new image to given dive
router.post("/new", (request, response) => {
    const { diverID, diveID } = request.body;
    const newDiverID = { diverID: diverID }
    const newDiveID = { diveID: diveID }
    response.render('images/newImage', { diverID: newDiverID, diveID: newDiveID });
});

// Display individual image associated with dive
router.get("/:id", (request, response) => {
    response.render("images/indImage");
});

// Image adding post route
router.post("/addImage", helperFunc.isLoggedIn, up.single('image'), (request, response) => {
    const newImage = {};
    newImage.diveID = request.body.diveID
    newImage.diverID = request.body.diverID
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
            await mysql.pool.query("INSERT INTO Images (diveID, diverID, description, imageURL) VALUES(?, ?, ?, ?)", queryData, async (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    fs.unlinkSync('uploads/' + request.file.filename);
                    newDiveID = { diveID: newImage.diveID }
                    userID = { diverID: newImage.diverID }
                    response.render("images/newImage", { diverID: userID, diveID: newDiveID });
                }
            });
        });

    }

    uploadFile('uploads/' + request.file.filename);

});

router.put("/editImage", helperFunc.isLoggedIn, up.single('image'), (request, response) => {
    request.session.diveID = request.body.diveID
    let isNull = request.body.diveID
    if(!(request.body.diveFKNull === "notNull")) {
        isNull = null
    }
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
                    'UPDATE Images SET description=?, imageURL=?, diveID=? WHERE imageID=?',
                    [request.body.description, newURL, isNull, request.body.imageID],
                    (error, result) => {
                        if (error) {
                            console.log(error);
                        } else {
                            fs.unlinkSync('uploads/' + request.file.filename);
                            response.redirect(307, '/dives/details')
                        }
                    }
                );
            });

        }

        uploadFile('uploads/' + request.file.filename);
    }
    else {
        mysql.pool.query(
            'UPDATE Images SET description=?, diveID=? WHERE imageID=?',
            [request.body.description, isNull, request.body.imageID],
            (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    response.redirect(307, '/dives/details')
                }
            }
        );
    }

});


router.delete('/deleteImage', helperFunc.isLoggedIn, (request, response) => {
    request.session.diveID = request.body.diveID
    mysql.pool.query(`DELETE FROM Images WHERE imageID=?`, parseInt(request.body.imageID), (error, result) => {
        if (error) {
            console.log(error);
        } else {
            response.redirect(307, '/dives/details')
        }
    });
});

module.exports = router;
