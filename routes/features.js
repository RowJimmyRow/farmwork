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

// Feature Database landing page
router.get("/", (request, response) => {
    mysql.pool.query("SELECT * FROM LocFeatures", async (error, rows, fields) => {
    response.render("features/feature", {features: rows}); 
    });
});
// Location add page (needed??)
router.get("/addFeature", helperFunc.isLoggedIn, (request, response) => {
    response.render("features/addFeature"); 
});

router.post("/addFeature", helperFunc.isLoggedIn, up.single('featurePhoto'), (request, response) => {
    const {locFeatureName} = request.body;
    const newFeature = [locFeatureName];
    const s3 = new AWS.S3({
        accessKeyId: ID,
        secretAccessKey: secretKey
    });

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
            newFeature.push(data.Location)
            await mysql.pool.query("INSERT INTO LocFeatures (locFeatureName, featureURL) VALUES(?, ?)", newFeature , async (error, result) => {
                if(error) {
                    console.log(error);
                } else {
                    fs.unlinkSync('uploads/' + request.file.filename);
                    response.redirect("/Features");
                }
            });
        });

    }

    uploadFile('uploads/' + request.file.filename);

});


// Render page to edit feature
router.post("/editFeature", helperFunc.isLoggedIn, (request, response) => {

    console.log(request.body.locationID)
    mysql.pool.query("SELECT * FROM LocFeatures WHERE featureID = ?", request.body.featureID, (error, rows, fields) => {
        if(error) {
            console.log(error)
        } else {
            response.render("features/editFeature", {feature : rows[0]});
        }
    });
});

// update page for edited feature
router.put("/editFeature", helperFunc.isLoggedIn, up.single('image'), (request, response) => {
    const {locFeatureName, featureID} = request.body;
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
                    'UPDATE LocFeatures SET locFeatureName=?, featureURL=? WHERE featureID=?',
                    [locFeatureName, newURL, featureID],
                    (error, result) => {
                        if (error) {
                            console.log(error);
                        } else {
                            fs.unlinkSync('uploads/' + request.file.filename);
                            response.redirect('/features')
                        }
                    }
                );
            });

        }

        uploadFile('uploads/' + request.file.filename);
    }
    else {
        mysql.pool.query(
            'UPDATE LocFeatures SET locFeatureName=? WHERE featureID=?',
            [locFeatureName, featureID],
            (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    response.redirect('/features')
                }
            }
        );
    }

});

module.exports = router;