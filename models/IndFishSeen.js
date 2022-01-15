const createString = `CREATE TABLE IF NOT EXISTS IndFishSeen(
    diveFishID INT PRIMARY KEY AUTO_INCREMENT UNIQUE, 
    diveID INT,
    FOREIGN KEY (diveID) REFERENCES Dives(diveID),
    fishID INT,
    FOREIGN KEY (fishID) REFERENCES AllTheFish(fishID)
    )`;
mysql.pool.query(createString, (error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("created Images")
    }
});