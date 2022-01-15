const createString = `CREATE TABLE IF NOT EXISTS AllDiveLocs(
    locationID INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    locCity VARCHAR(255) NOT NULL,
    locState VARCHAR(255),
    locCountry VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    )`;
mysql.pool.query(createString, (error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("created AllDiveLocs")
    }
});