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


// Fish Database landing page
router.get("/", (request, response) => {
    mysql.pool.query("SELECT * FROM AllTheFish", async (error, rows, fields) => {
        response.render("fish/fish", { fish: rows });
    });
});

// Fish adding page
router.get("/addFish", helperFunc.isLoggedIn, (request, response) => {
    response.render("fish/addFish");
});

// Fish adding post route
router.post("/addFish", helperFunc.isLoggedIn, up.single('fishPhoto'), (request, response) => {
    const newFish = {};
    newFish.commonName = request.body.commonName
    newFish.scientificName = request.body.scientificName
    newFish.description = request.body.description
    const queryData = Object.values(newFish)

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
            await mysql.pool.query("INSERT INTO AllTheFish (commonName, scientificName, description, imageURL) VALUES(?, ?, ?, ?)", queryData, async (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    fs.unlinkSync('uploads/' + request.file.filename);
                    response.redirect("/fish");
                }
            });
        });

    }

    uploadFile('uploads/' + request.file.filename);

});

// Fish Edit page
router.post("/editFish", helperFunc.isLoggedIn, (request, response) => {
    mysql.pool.query("SELECT * FROM AllTheFish WHERE fishID = ?", request.body.fishID, (error, rows, fields) => {
        if (error) {
            console.log(error)
        } else {
            response.render("fish/editFish", { fish: rows[0] });
        }
    });
});


router.put("/editFish", helperFunc.isLoggedIn, up.single('fishImage'), (request, response) => {
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
                fs.unlinkSync('uploads/' + request.file.filename);
                await mysql.pool.query(
                    'UPDATE AllTheFish SET commonName=?, scientificName=?, description=?, imageURL=? WHERE fishID=?',
                    [request.body.commonName, request.body.scientificName, request.body.description, newURL, request.body.fishID],
                    (error, result) => {
                        if (error) {
                            console.log(error);
                        } else {
                            response.redirect('/fish')
                        }
                    }
                );
            });

        }

        uploadFile('uploads/' + request.file.filename);
    }
    else {
        mysql.pool.query(
            'UPDATE AllTheFish SET commonName=?, scientificName=?, description=? WHERE fishID=?',
            [request.body.commonName, request.body.scientificName, request.body.description, request.body.fishID],
            (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    response.redirect('/fish')
                }
            }
        );
    }

});

module.exports = router;