// server.js

const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db"); // Import your database functions

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Route to fetch all job locations
app.get("/jobLocations", (req, res) => {
  db.getAllJobLocations((err, jobLocations) => {
    if (err) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json({ jobLocations });
    }
  });
});

// Route to add a new job location
app.post("/addJobLocation", (req, res) => {
  const { address } = req.body;
  // Call the appropriate function from your database module to insert the job location
  db.insertJobLocation(address, (err, jobId) => {
    if (err) {
      console.error("Error adding job location:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json({ success: true, jobId });
    }
  });
});

// Route to calculate the optimized route
app.post("/calculateRoute", (req, res) => {
  const { addresses } = req.body;

  if (!Array.isArray(addresses) || addresses.length < 2) {
    return res.status(400).json({ error: "Invalid input addresses" });
  }

  // Define a function to calculate the distance between two points
  const calculateDistance = (point1, point2) => {
    // Calculate the Euclidean distance between two points
    const dx = point1.lat - point2.lat;
    const dy = point1.lng - point2.lng;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const findNearestNeighbor = (currentPoint, remainingPoints) => {
    if (remainingPoints.length === 0) return [];

    // Find the nearest neighbor among the remaining points
    let nearestIndex = -1;
    let nearestDistance = Number.MAX_VALUE;
    for (let i = 0; i < remainingPoints.length; i++) {
      const distance = calculateDistance(currentPoint, remainingPoints[i]);
      if (distance < nearestDistance) {
        nearestIndex = i;
        nearestDistance = distance;
      }
    }

    // Remove the nearest neighbor from the remaining points
    const nearestPoint = remainingPoints.splice(nearestIndex, 1)[0];

    // Recursively find the next nearest neighbor
    const nextRoute = findNearestNeighbor(nearestPoint, remainingPoints);

    // Return the optimized route
    return [nearestPoint, ...nextRoute];
  };

  // Start with the first address as the current point
  const currentPoint = addresses[0];

  // Clone the addresses array to avoid modifying the original array
  const remainingPoints = [...addresses.slice(1)];

  // Find the optimized route using the nearest neighbor algorithm
  const optimizedRoute = [
    currentPoint,
    ...findNearestNeighbor(currentPoint, remainingPoints),
  ];

  console.log("Calculated optimizedRoute:", optimizedRoute);
  // Return the optimized route in the response
  res.json({ optimizedRoute });
});

// Route to mark a job as completed
app.post("/markJobCompleted", (req, res) => {
  const { jobId } = req.body;
  db.markJobCompleted(jobId, (err) => {
    if (err) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json({ success: true });
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
