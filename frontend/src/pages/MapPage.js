import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  LoadScript,
  GoogleMap,
  StandaloneSearchBox,
  Marker,
} from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import { Shop } from "../Shop";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";

const libs = ["places"];

export default function MapScreen() {
  const { etat, dispatch: ctxDispatch } = useContext(Shop);
  const { userInfo } = etat;
  const navigate = useNavigate();
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [loading, setLoading] = useState(true); // New state variable for loading status
  const [mapCenter, setMapCenter] = useState(null); // Change 'location' to 'mapCenter'

  const mapRef = useRef(null);
  const placeRef = useRef(null);
  const markerRef = useRef(null);

  const getUserCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser");
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        setMapCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
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
  };

  const onLoadPlaces = (place) => {
    placeRef.current = place;
  };

  const onPlacesChanged = () => {
    const place = placeRef.current.getPlaces()[0].geometry.location;
    setMapCenter({ lat: place.lat(), lng: place.lng() });
  };

  const onMarkerLoad = (marker) => {
    markerRef.current = marker;
  };

  const onConfirm = () => {
    const places = placeRef.current.getPlaces() || [{}];
    ctxDispatch({
      type: "SAVE_LIVRAISON_ADDRESS_MAP_LOCATION",
      payload: {
        lat: mapCenter.lat,
        lng: mapCenter.lng,
        address: places[0].formatted_address,
        name: places[0].name,
        vicinity: places[0].vicinity,
        googleAddressId: places[0].id,
      },
    });
    toast.success("Location selected successfully.");
    navigate("/livraison");
  };

  if (loading) {
    // Render a loading indicator while fetching the API key
    return <div>Loading...</div>;
  }

  return (
    <div className="full-box">
      <LoadScript libraries={libs} googleMapsApiKey={googleApiKey}>
        <GoogleMap
          id="sample-map"
          mapContainerStyle={{ height: "100%", width: "100%" }}
          center={mapCenter} // Change 'location' to 'mapCenter'
          zoom={15}
          onLoad={onLoad}
        >
          <StandaloneSearchBox
            onLoad={onLoadPlaces}
            onPlacesChanged={onPlacesChanged}
          >
            <div className="map-input-box">
              <input type="text" placeholder="Enter your address"></input>
              <Button type="button" onClick={onConfirm}>
                Confirm
              </Button>
            </div>
          </StandaloneSearchBox>
          {mapCenter && <Marker position={mapCenter} onLoad={onMarkerLoad} />}{" "}
          {/* Change 'location' to 'mapCenter' */}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
