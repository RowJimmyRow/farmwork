const createString = `CREATE TABLE IF NOT EXISTS AllTheFish(
    fishID INT PRIMARY KEY AUTO_INCREMENT UNIQUE, 
    commonName VARCHAR(255),
    scientificName VARCHAR(255),
    description VARCHAR(255) NOT NULL,
    imageURL VARCHAR(255)
    )`;
mysql.pool.query(createString, (error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("created Images")
    }
});