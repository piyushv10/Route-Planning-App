const express = require("express");

const {
  getAllJobLocations,
  insertJobLocation,
  markJobCompleted,
} = require("./db");

const { CONSTRAINT } = require("sqlite3");

const router = express.Router();

router.get("/jobLocations", (req, res) => {
  getAllJobLocations((err, jobLocations) => {
    if (err) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json({ jobLocations });
    }
  });
});

router.post("/addJobLocation", (req, res) => {
  const { address } = req.body;
  insertJobLocation(address, (err, jobId) => {
    if (err) {
      console.error("Error adding job location:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json({ success: true, jobId });
    }
  });
});

router.post("/calculateRoute", (req, res) => {
  console.log("calculating...");
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
      console.log(currentPoint, remainingPoints);
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

router.post("/markJobCompleted", (req, res) => {
  // Route logic for marking a job as completed
  const { jobId } = req.body;
  markJobCompleted(jobId, (err) => {
    if (err) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json({ success: true });
    }
  });
});

module.exports = router;
