const sqlite3 = require("sqlite3").verbose();

// Connect to SQLite database
const db = new sqlite3.Database("database.db", (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS job_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS job_completion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER,
    completed BOOLEAN,
    FOREIGN KEY(job_id) REFERENCES job_locations(id)
  )`);
});

// Function to insert job location
const insertJobLocation = (address, callback) => {
  db.run(
    "INSERT INTO job_locations (address) VALUES (?)",
    [address],
    function (err) {
      if (err) {
        console.error("Error inserting job location:", err.message);
        callback(err);
      } else {
        console.log(
          `A new job location has been inserted with ID ${this.lastID}`
        );
        callback(null, this.lastID);
      }
    }
  );
};

// Function to mark job as completed
const markJobCompleted = (jobId, callback) => {
  db.run(
    "INSERT INTO job_completion (job_id, completed) VALUES (?, ?)",
    [jobId, true],
    function (err) {
      if (err) {
        console.error("Error marking job as completed:", err.message);
        callback(err);
      } else {
        console.log(`Job with ID ${jobId} has been marked as completed.`);
        callback(null);
      }
    }
  );
};

// Function to retrieve all job locations
const getAllJobLocations = (callback) => {
  db.all("SELECT * FROM job_locations", (err, rows) => {
    if (err) {
      console.error("Error retrieving job locations:", err.message);
      callback(err, null);
    } else {
      callback(null, rows);
    }
  });
};

module.exports = {
  insertJobLocation,
  markJobCompleted,
  getAllJobLocations,
};
