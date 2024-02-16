// db.js

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

// Function to insert a job location into the database
function insertJobLocation(address, callback) {
  db.run('INSERT INTO job_locations (address) VALUES (?)', [address], function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null, this.lastID); // Return the ID of the inserted row
    }
  });
}

// Function to mark a job as completed in the database
function markJobCompleted(jobId, callback) {
  db.run('UPDATE job_completion SET completed = 1 WHERE job_id = ?', [jobId], function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

// Function to retrieve all job locations from the database
function getAllJobLocations(callback) {
  db.all('SELECT * FROM job_locations', function(err, rows) {
    if (err) {
      callback(err);
    } else {
      callback(null, rows);
    }
  });
}

module.exports = {
  insertJobLocation,
  markJobCompleted,
  getAllJobLocations
};
