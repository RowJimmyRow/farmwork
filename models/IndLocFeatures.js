const createString = `CREATE TABLE IF NOT EXISTS IndlocFeatures(
    indLocFeatID INT PRIMARY KEY AUTO_INCREMENT UNIQUE,
    locationID INT,
    FOREIGN KEY (locationID) REFERENCES AllDiveLocs(locationID),
    featureID INT,
    FOREIGN KEY (featureID) REFERENCES DiveFeatures(featureID)
    )`;

mysql.pool.query(createString, (error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("created indDiveFeatures")
    }
});