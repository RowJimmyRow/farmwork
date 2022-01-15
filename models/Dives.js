const createString = `CREATE TABLE IF NOT EXISTS Dives(
    diveID INT PRIMARY KEY AUTO_INCREMENT UNIQUE NOT NULL, 
    diverID NOT NULL INT,
    FOREIGN KEY (diverID) REFERENCES Users(diverID),
    locationID NOT NULL INT,
    FOREIGN KEY (locationID) REFERENCES AllDiveLocs(locationID),
    date DATETIME NOT NULL,
    timeDuration TIME NOT NULL,
    visibility VARCHAR(255),
    temp INT,
    )`;
mysql.pool.query(createString, (error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("created Dives")
    }
});