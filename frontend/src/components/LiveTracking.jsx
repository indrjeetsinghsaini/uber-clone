import React, { useState, useEffect } from 'react'
// We will use the GoogleMap component from the external library, but for the API loader, 
// sometimes the useJsApiLoader hook is more reliable in this environment. 
// However, since LoadScript is part of the library, we will stick to it and assume the library is now accessible.
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api' 

const containerStyle = {
    width: '100%',
    height: '100%',
};

const center = {
    lat: -3.745,
    lng: -38.523 // Default center for Ceará, Brazil (example)
};

// Retaining the prop signature used in Home.jsx
const LiveTracking = ({ pickup, destination, directionsResponse, ride }) => {
    const [ currentPosition, setCurrentPosition ] = useState(center);
    
    // We add 'places' library for autocomplete functionality later, which requires inclusion here.
    const libraries = ['places']; 

    useEffect(() => {
        // Handler to process location updates
        const updatePosition = (position) => {
            const { latitude, longitude } = position.coords;

            // Retaining console log from your original code
            console.log('Position updated:', latitude, longitude); 
            setCurrentPosition({
                lat: latitude,
                lng: longitude
            });
        };

        // 1. Get initial position
        navigator.geolocation.getCurrentPosition(updatePosition, (error) => {
            console.error("Error getting initial position:", error);
        });

        // 2. Watch for continuous position changes
        const watchId = navigator.geolocation.watchPosition(updatePosition, (error) => {
             console.error("Error watching position:", error);
        });

        // Cleanup the watchPosition listener when the component unmounts
        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    return (
        // The LoadScript component requires the Google Maps API Key and the libraries array
        <LoadScript googleMapsApiKey={""} libraries={libraries}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={currentPosition}
                zoom={15}
                options={{
                    disableDefaultUI: true, // Optional: Hide controls for cleaner look
                    zoomControl: true,
                }}
            >
                {/* Marker showing the current device's location */}
                <Marker position={currentPosition} />
            </GoogleMap>
        </LoadScript>
    )
}

export default LiveTracking
