
const createString = `CREATE TABLE IF NOT EXISTS Users(
    diverID INT PRIMARY KEY AUTO_INCREMENT UNIQUE NOT NULL, 
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    email VARCHAR(255),
    

    )`;
mysql.pool.query(createString, (error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("created User")
    }
});

