import "./App.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Map from "./Map"; // Import the Map component

function App() {
  const [addresses, setAddresses] = useState([]);
  const [inputAddress, setInputAddress] = useState("");
  const [technicianLocation, setTechnicianLocation] = useState("");
  const [showRoute, setShowRoute] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const apikey = "AIzaSyDvUk6R0oR6GN0CE3q-mNTkIbv4t9GUCP4";

  const handleAddAddress = () => {
    if (inputAddress.trim() !== "") {
      setAddresses([...addresses, inputAddress]);
      setInputAddress("");
    }
  };

  // const handlePlanRoute = async () => {
  //   try {
  //     // Send a request to the backend to calculate the optimized route
  //     const response = await axios.post('/calculateRoute', { addresses: addresses });
  //     const calculatedRoute = response.data.optimizedRoute;
  //     console.log('Received optimizedRoute:', calculatedRoute);
  //     setOptimizedRoute(calculatedRoute);
  //     setShowRoute(true); // Show the route on the map
  //     console.log("route created");
  //   } catch (error) {
  //     console.error('Error planning route:', error);
  //   }
  // };

  const handlePlanRoute = async () => {
    try {
      const response = await fetch("/calculateRoute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ addresses }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate route");
      }

      const data = await response.json();
      const calculatedRoute = data.optimizedRoute;
      console.log("optimized route ", calculatedRoute);
      setOptimizedRoute(calculatedRoute);
      setShowRoute(true); // Show the route on the map
    } catch (error) {
      console.error("Error planning route:", error);
    }
  };

  const handleJobCompletion = async (index) => {
    try {
      // Send a request to mark the job as completed
      await axios.post("/markJobCompleted", { jobId: index });
      setCompletedJobs([...completedJobs, index]);
    } catch (error) {
      console.error("Error marking job as completed:", error);
    }
  };

  const handleTechnicianLocationChange = (e) => {
    setTechnicianLocation(e.target.value);
  };

  const handleTechnicianLocation = async () => {
    try {
      // Geocode the technician's location to get its coordinates
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: technicianLocation,
            key: apikey,
          },
        }
      );

      const { results } = response.data;
      if (results && results.length > 0) {
        const { lat, lng } = results[0].geometry.location;
        // Update the technician's location
        setTechnicianLocation(`${lat},${lng}`);
        setTechnicianLocation("");
      }
    } catch (error) {
      console.error("Error setting technician location:", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={inputAddress}
        onChange={(e) => setInputAddress(e.target.value)}
        placeholder="Enter address"
      />
      <button onClick={handleAddAddress}>Add Address</button>

      <input
        type="text"
        value={technicianLocation}
        onChange={handleTechnicianLocationChange}
        placeholder="Enter technician's location"
      />
      <button onClick={handleTechnicianLocation}>
        Add Technician's Location
      </button>

      {apikey && (
        <Map
          addresses={addresses}
          optimizedRoute={optimizedRoute}
          technicianLocation={technicianLocation}
          showRoute={showRoute}
          completedJobs={completedJobs}
          apikey={apikey}
          onCompleteJob={handleJobCompletion}
        />
      )}
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        <button onClick={handlePlanRoute}>Plan Route</button>
      </div>
    </div>
  );
}

export default App;
