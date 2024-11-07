// MapComponent.js
import L from 'leaflet'; // Import Leaflet from npm package if installed

// Function to initialize the map
export function initializeMap(mapId) {
  // Create a map instance centered on a specific location
  const map = L.map(mapId).setView([51.505, -0.09], 13);

  // Add a tile layer to the map (this provides the map visuals from an open-source provider)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Add a marker at the same location
  const marker = L.marker([51.505, -0.09]).addTo(map);
  marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
}