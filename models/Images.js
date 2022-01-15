const createString = `CREATE TABLE IF NOT EXISTS Images(
    imageID INT PRIMARY KEY AUTO_INCREMENT,
    diveID INT,
    FOREIGN KEY (diveID) REFERENCES Dives(diveID),
    diverID INT NOT NULL,
    FOREIGN KEY (diverID) REFERENCES Users(diverID),
    description VARCHAR(255) NOT NULL,
    imageURL VARCHAR(255) NOT NULL
    )`;
mysql.pool.query(createString, (error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("created Images")
    }
});