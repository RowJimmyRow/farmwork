const createString = `CREATE TABLE IF NOT EXISTS LocFeatures(
    featureID INT PRIMARY KEY AUTO_INCREMENT UNIQUE NOT NULL,
    locFeatureName VARCHAR(255) NOT NULL,
    featureID VARCHAR(255),
    )`;

mysql.pool.query(createString, (error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("created indDiveFeatures")
    }
});