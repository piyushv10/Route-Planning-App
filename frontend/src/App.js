import "./App.css";
import React, { useState } from "react";
import axios from "axios";
import Map from "./Map";

const baseURL = "http://localhost:8080";

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

  const handlePlanRoute = async () => {
    try {
      const coordinates = []; // Array to store extracted coordinates

      // Iterate over each address in the addresses array
      for (const address of addresses) {
        // Geocode the address to get its coordinates
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json`,
          {
            params: {
              address: address,
              key: apikey,
            },
          }
        );

        const { results } = response.data;
        if (results && results.length > 0) {
          const { lat, lng } = results[0].geometry.location;
          coordinates.push({ lat, lng }); // Push coordinates to the array
        }
      }

      const response = await axios.post(`${baseURL}/calculateRoute`, {
        addresses: coordinates, // Send extracted coordinates instead of addresses
      });

      const calculatedRoute = response.data.optimizedRoute;
      console.log("optimized route ", calculatedRoute);
      setOptimizedRoute(calculatedRoute);
      console.log(calculatedRoute);
      setShowRoute(true); // Show the route on the map
      console.log("route created");
    } catch (error) {
      console.error("Error planning route:", error);
    }
  };

  const handleJobCompletion = async (index) => {
    try {
      await fetch(baseURL + "/markJobCompleted", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId: index }),
      });
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
    <div className="App">
      <div>
        <input
          type="text"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          placeholder="Enter address"
        />

        <button onClick={handleAddAddress}>Add Address</button>
      </div>
      <div>
        <input
          type="text"
          value={technicianLocation}
          onChange={handleTechnicianLocationChange}
          placeholder="Enter technician's location"
        />
        <button onClick={handleTechnicianLocation}>
          Add Technician's Location
        </button>
      </div>
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
      <div>
        <button onClick={handlePlanRoute}>
          Plan Route
        </button>
      </div>
    </div>
  );
}

export default App;
