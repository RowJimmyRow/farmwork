const express = require("express"),
    router = express.Router(),
    path = require('path'),
    multer = require('multer'),
    up = multer({ dest: 'uploads/' }),
    fs = require('fs'),
    AWS = require('aws-sdk'),
    dotenv = require('dotenv').config();

    const ID = process.env.ID;
    const secretKey = process.env.secretKey;

router.post('/', up.single('myImage'), function (req, res) {

    const s3 = new AWS.S3({
        accessKeyId: ID,
        secretAccessKey: secretKey
    });

    const BUCKET_NAME = 'divetastic-images'
    const FILE_NAME = req.file.filename

    const uploadFile = (fileName) => {
        const fileContent = fs.readFileSync(fileName);


        const params = {
            Bucket: BUCKET_NAME,
            Key: FILE_NAME + req.file.originalname.match(/\.[0-9a-z]+$/i)[0],
            Body: fileContent
        };

        s3.upload(params, function (err, data) {
            if (err) {
                throw err;
            }
            console.log(data)
        });

    }

    uploadFile('uploads/' + req.file.filename);

    // res.set({ 'Content-Type': req.file.mimetype });
    // res.sendFile(path.join(__dirname + '//uploads//' + req.file.filename));
    res.send("Upload Successful!")
    fs.unlinkSync('uploads/' + req.file.filename);
});

module.exports = router;