import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  LoadScript,
  GoogleMap,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { Shop } from "../Shop";
import { toast } from "react-toastify";

const defaultLocation = { lat: 45.516, lng: -73.56 };
const libs = ["places"];

export default function MapScreen() {
  const { etat, dispatch: ctxDispatch } = useContext(Shop);
  const { userInfo } = etat;
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [center, setCenter] = useState(defaultLocation);
  const [location, setLocation] = useState(center);
  const [loading, setLoading] = useState(true); // New state variable for loading status
  const [directions, setDirections] = useState(null);
  const [isNavigationStarted, setIsNavigationStarted] = useState(false);

  const mapRef = useRef(null);

  const getUserCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser");
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        const origin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const destination = { lat: 35.7596, lng: -5.833 };

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin,
            destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (response, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              setDirections(response);
            } else {
              toast.error("Failed to get directions");
            }
          }
        );

        setCenter(origin);
        setLocation(origin);
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios("/api/keys/google", {
          headers: { Authorization: `BEARER ${userInfo.token}` },
        });
        setGoogleApiKey(data.key);
        getUserCurrentLocation();
      } catch (error) {
        console.error("Error fetching Google API key:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    ctxDispatch({
      type: "SET_FULLBOX_ON",
    });
  }, [ctxDispatch]);

  const onLoad = (map) => {
    mapRef.current = map;

    if (navigator.geolocation && isNavigationStarted) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const updatedCenter = { lat: latitude, lng: longitude };
          setCenter(updatedCenter);
          setLocation(updatedCenter);
          map.panTo(updatedCenter);
          map.setZoom(15); // Zoom to level 15 when navigation starts
        },
        (error) => {
          console.error("Error retrieving user's current location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser");
    }
  };

  const onIdle = () => {
    setLocation({
      lat: mapRef.current.center.lat(),
      lng: mapRef.current.center.lng(),
    });
  };

  const handleStartNavigation = () => {
    setIsNavigationStarted(true);
  };

  if (loading) {
    // Render a loading indicator while fetching the API key
    return <div>Loading...</div>;
  }

  return (
    <div className="mini-map">
      <LoadScript libraries={libs} googleMapsApiKey={googleApiKey}>
        <GoogleMap
          id="sample-map"
          mapContainerStyle={{ height: "50vh", width: "100%" }}
          center={center}
          onLoad={onLoad}
          onIdle={onIdle}
        >
          {directions && isNavigationStarted && (
            <DirectionsRenderer
              options={{
                directions: directions,
                markerOptions: { visible: false },
                polylineOptions: {
                  strokeColor: "#0000FF",
                  strokeOpacity: 0.7,
                  strokeWeight: 5,
                },
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
      <button onClick={handleStartNavigation}>Start Navigation</button>
    </div>
  );
}
