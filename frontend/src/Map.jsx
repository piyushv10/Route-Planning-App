import React, { useEffect, useState } from 'react';

function Map({ addresses, optimizedRoute, technicianLocation, showRoute, completedJobs, apikey, onCompleteJob}) {
  const [map, setMap] = useState(null);
  const [technicianMarker, setTechnicianMarker] = useState(null);

  useEffect(() => {
    if (showRoute && optimizedRoute.length > 0 && map) {
      
      // Define an array to store the coordinates of the optimized route
      const routeCoordinates = optimizedRoute.map(point => ({ lat: point.lat, lng: point.lng }));
      
      // Create a polyline to represent the route
      const routePolyline = new window.google.maps.Polyline({
        path: routeCoordinates,
        geodesic: true,
        strokeColor: '#FF0000', // Set the color of the route line
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });

      // Set the map for the polyline
      routePolyline.setMap(map);

    }
  }, [showRoute, optimizedRoute, map,technicianLocation]);

  useEffect(() => {
    if (map && addresses.length > 0) {
      // Clear existing markers
      const bounds = new window.google.maps.LatLngBounds();
      addresses.forEach((address, index) => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK') {
            // eslint-disable-next-line
            const marker = new window.google.maps.Marker({
              position: results[0].geometry.location,
              map,
              title: `Address ${index + 1}`,
            });
            bounds.extend(results[0].geometry.location);
            map.fitBounds(bounds);
          }
        });
      });
    }
  }, [map, addresses]);

  useEffect(() => {
    if (map && technicianLocation) {
      // Geocode the technician's location to get its coordinates
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: technicianLocation }, (results, status) => {
        if (status === 'OK') {
          const technicianPosition = results[0].geometry.location;
          // Create a marker for the technician's location
          const marker = new window.google.maps.Marker({
            position: technicianPosition,
            map,
            title: 'Technician Location',
          });
          // Set the map for the technician marker
          setTechnicianMarker(marker);
        } 
      });
    }
  }, [map, technicianLocation]);

  useEffect(() => {
    if (technicianMarker) {
      // Remove the technician marker when component unmounts
      return () => {
        technicianMarker.setMap(null);
      };
    }
  }, [technicianMarker]);

  useEffect(() => {
    if (!map) {
      // Load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apikey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        const mapInstance = new window.google.maps.Map(document.getElementById('map'), {
          center: { lat: 0, lng: 0 },
          zoom: 2,
        });
        setMap(mapInstance);
      };

      script.onerror = () => {
        console.error('Failed to load Google Maps API script.');
      };

      document.head.appendChild(script);

      return () => {
        // Clean up to prevent memory leaks
        document.head.removeChild(script);
      };
    }
  }, [map, apikey]);

  return <div id="map" style={{ width: '100%', height: '400px' }} />;
}

export default Map;
