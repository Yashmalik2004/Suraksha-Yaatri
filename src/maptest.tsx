import { GoogleMap, LoadScript } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 28.6139, // Delhi
  lng: 77.2090,
};

export default function MapTest() {
  console.log("API KEY:", import.meta.env.VITE_GOOGLE_MAPS_API_KEY); // Debug check

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      onError={(e) => console.error("Google Maps failed to load:", e)}
    >
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        {/* Empty map just for test */}
      </GoogleMap>
    </LoadScript>
  );
}
