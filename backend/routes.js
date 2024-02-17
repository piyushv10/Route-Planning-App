const express = require("express");
const axios = require("axios");
const apikey = "AIzaSyDvUk6R0oR6GN0CE3q-mNTkIbv4t9GUCP4";
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

router.post("/calculateRoute", async (req, res) => {
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

  // Start with the first address as the current point i.e Technician's Location
  const currentPoint = addresses[0];

  // Clone the addresses array to avoid modifying the original array
  const remainingPoints = [...addresses.slice(1)];

  // Find the optimized route using the nearest neighbor algorithm
  const optimizedRoute = [
    currentPoint,
    ...findNearestNeighbor(currentPoint, remainingPoints),
  ];

  res.json({ optimizedRoute });
});

router.post("/markJobCompleted", async (req, res) => {
  try {
    // Extract jobId from the request body
    const { jobId } = req.body;

    // Call the markJobCompleted function with the jobId
    markJobCompleted(jobId, (err) => {
      if (err) {
        // If there's an error, send a 500 Internal Server Error response
        console.error("Error marking job as completed:", err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        // If successful, send a success response
        res.json({ success: true });
      }
    });
  } catch (error) {
    // If there's an unhandled exception, send a 500 Internal Server Error response
    console.error("Error marking job as completed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
