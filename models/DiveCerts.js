const createString = `CREATE TABLE IF NOT EXISTS DiveCerts(
  certificationID INT PRIMARY KEY AUTO_INCREMENT, 
  diverID INT,
  certNum VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  FOREIGN KEY (diverID) REFERENCES Users(diverID)
  )`;
mysql.pool.query(createString, (error) => {
  if (error) {
    console.log(error)
  } else {
    console.log("created Certs")
  }
});