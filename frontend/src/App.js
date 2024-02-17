import "./App.css";
import React, { useState, useEffect } from "react";
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
  const [jobLocations, setJobLocations] = useState([]);
  const apikey = "AIzaSyDvUk6R0oR6GN0CE3q-mNTkIbv4t9GUCP4";

  // useEffect(() => {
  //   // Fetch job locations when the component mounts
  //   fetchJobLocations();
  // }, []);

  const fetchJobLocations = async () => {
    try {
      const response = await axios.get(`${baseURL}/jobLocations`);
      console.log(response.data.jobLocations);
      setJobLocations(response.data.jobLocations);
    } catch (error) {
      console.error("Error fetching job locations:", error);
    }
  };

  const handleAddAddress = async () => {
    if (inputAddress.trim() !== "") {
      try {
        // Send a POST request to the /addJobLocation endpoint
        const response = await axios.post(`${baseURL}/addJobLocation`, {
          address: inputAddress,
        });

        // Extract the jobId from the response data
        const jobId = response.data.jobId;

        // Update the addresses state with the new address
        setAddresses([...addresses, inputAddress]);

        // Clear the input field
        setInputAddress("");
      } catch (error) {
        console.error("Error adding job location:", error);
      }
    }
  };

  const handlePlanRoute = async () => {
    try {
      const coordinates = []; // Array to store extracted coordinates

      if (technicianLocation.trim() !== "") {
        // Geocode the technician's location to get its coordinates
        const technicianResponse = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json`,
          {
            params: {
              address: technicianLocation,
              key: apikey,
            },
          }
        );

        const technicianResults = technicianResponse.data.results;
        if (technicianResults && technicianResults.length > 0) {
          const { lat, lng } = technicianResults[0].geometry.location;
          coordinates.push({ lat, lng }); // Push technician's coordinates to the array
        }
      }

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
        addresses: coordinates,
      });
      const calculatedRoute = response.data.optimizedRoute;

      setOptimizedRoute(calculatedRoute);

      setShowRoute(true); // Show the route on the map
    } catch (error) {
      console.error("Error planning route:", error);
    }
  };

  const handleJobCompletion = async (index) => {
    try {
      const response = await axios.post(`${baseURL}/markJobCompleted`, {
        jobId: index,
      });

      // const updatedAddresses = addresses.filter((_, i) => i !== index);
      // setAddresses(updatedAddresses);

      // await fetch(baseURL + "/markJobCompleted", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ jobId: index }),
      // });

      // Update the list of completed jobs
      setCompletedJobs([...completedJobs, index]);
      // await handlePlanRoute();
    } catch (error) {
      console.error("Error marking job as completed:", error);
    }
  };

  const handleTechnicianLocationChange = (e) => {
    setTechnicianLocation(e.target.value);
  };

  const handleTechnicianLocation = () => {};

  return (
    <div className="App">
      <div>
        <input
          type="text"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          placeholder="Enter Address"
        />

        <button onClick={handleAddAddress}>Add Address</button>
      </div>
      <div>
        <input
          type="text"
          value={technicianLocation}
          onChange={handleTechnicianLocationChange}
          placeholder="Enter Technician's Location"
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
        <button onClick={handlePlanRoute}>Plan Route</button>
      </div>
      {/* Render job completion buttons */}
      {addresses.map((address, index) => (
        <div key={index}>
          {!completedJobs.includes(index) && (
            <button onClick={() => handleJobCompletion(index)}>
              {address} - Mark as Completed?
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default App;
