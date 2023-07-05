import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  LoadScript,
  GoogleMap,
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
  const [currentLocation, setCurrentLocation] = useState(null);
  const [hasReachedDestination, setHasReachedDestination] = useState(false);

  const mapRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);

  const getUserCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser");
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const origin = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setCurrentLocation(origin);
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    }
  };

  useEffect(() => {
    const fetchGoogleApiKey = async () => {
      try {
        const { data } = await axios("/api/keys/google", {
          headers: { Authorization: `BEARER ${userInfo.token}` },
        });
        setGoogleApiKey(data.key);
      } catch (error) {
        console.error("Error fetching Google API key:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoogleApiKey();
  }, [userInfo.token]);

  useEffect(() => {
    if (currentLocation) {
      directionsServiceRef.current.route(
        {
          origin: currentLocation,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(response);
            const { distance, duration } = response.routes[0].legs[0];
            setDistance(distance.text);
            setDuration(duration.text);
            setZoom(15);
          } else {
            toast.error("Failed to get directions");
          }
        }
      );

      setCenter(currentLocation);
      setLocation(currentLocation);
    }
  }, [currentLocation, destination]);

  useEffect(() => {
    if (isNavigationStarted && currentLocation) {
      const checkArrival = setInterval(() => {
        const currentDistance =
          window.google.maps.geometry.spherical.computeDistanceBetween(
            currentLocation,
            destination
          );

        if (currentDistance <= 100) {
          setHasReachedDestination(true);
          clearInterval(checkArrival);
        }
      }, 5000);

      return () => clearInterval(checkArrival);
    }
  }, [isNavigationStarted, currentLocation, destination]);

  const onLoad = (map) => {
    mapRef.current = map;
    directionsServiceRef.current = new window.google.maps.DirectionsService();
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
    });
    directionsRendererRef.current.setMap(mapRef.current);
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
    getUserCurrentLocation();
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
          {directions && isNavigationStarted && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: "#0000FF",
                  strokeOpacity: 0.7,
                  strokeWeight: 5,
                },
              }}
              onLoad={(directionsRenderer) => {
                directionsRendererRef.current = directionsRenderer;
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
      {isNavigationStarted && (
        <>
          <div>
            <p>Distance: {distance}</p>
            <p>Duration: {duration}</p>
          </div>
          {hasReachedDestination && <p>Arrived at destination!</p>}
        </>
      )}
      {!isNavigationStarted && (
        <div className="text-center2 mt-3">
          <button className="btn btn-primary" onClick={handleStartNavigation}>
            Start Navigation
          </button>
        </div>
      )}
    </div>
  );
}
