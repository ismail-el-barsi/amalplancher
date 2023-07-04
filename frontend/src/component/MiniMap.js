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

export default function MapScreen({ destination }) {
  const { etat, dispatch: ctxDispatch } = useContext(Shop);
  const { userInfo } = etat;
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [center, setCenter] = useState(defaultLocation);
  const [location, setLocation] = useState(center);
  const [loading, setLoading] = useState(true);
  const [directions, setDirections] = useState(null);
  const [isNavigationStarted, setIsNavigationStarted] = useState(false);
  const [zoom, setZoom] = useState(13);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [destinationChanged, setDestinationChanged] = useState(false);

  const mapRef = useRef(null);

  const getUserCurrentLocation = (destination) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser");
    } else {
      navigator.geolocation.watchPosition(
        (position) => {
          const origin = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

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
                const { distance, duration } = response.routes[0].legs[0];
                setDistance(distance.text);
                setDuration(duration.text);
              } else {
                toast.error("Failed to get directions");
              }
            }
          );

          setCenter(origin);
          setLocation(origin);
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios("/api/keys/google", {
          headers: { Authorization: `BEARER ${userInfo.token}` },
        });
        setGoogleApiKey(data.key);
        getUserCurrentLocation(destination);
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

    setDestinationChanged(false);
  }, [ctxDispatch, destination, userInfo.token]);

  const onLoad = (map) => {
    mapRef.current = map;
  };

  const onIdle = () => {
    if (!isNavigationStarted) {
      setLocation({
        lat: mapRef.current.center.lat(),
        lng: mapRef.current.center.lng(),
      });
      setZoom(mapRef.current.zoom);
    }
  };

  const handleStartNavigation = () => {
    setIsNavigationStarted(true);
    getUserCurrentLocation(destination);
    setZoom(15);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mini-map">
      <LoadScript libraries={libs} googleMapsApiKey={googleApiKey}>
        <GoogleMap
          id="sample-map"
          mapContainerStyle={{ height: "50vh", width: "100%" }}
          center={isNavigationStarted ? center : location}
          zoom={zoom}
          onLoad={onLoad}
          onIdle={onIdle}
        >
          {directions && isNavigationStarted && destinationChanged && (
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
      {isNavigationStarted && (
        <div>
          <p>Distance: {distance}</p>
          <p>Duration: {duration}</p>
        </div>
      )}
      <button onClick={handleStartNavigation}>Start Navigation</button>
    </div>
  );
}
