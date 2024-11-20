import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import proj4 from 'proj4';
import 'proj4leaflet';

export function initializeMap(mapId, households, stores) {

    // Remove existing map instance if it exists
    if (L.DomUtil.get(mapId) && L.DomUtil.get(mapId)._leaflet_id) {
        L.DomUtil.get(mapId)._leaflet_id = null; // Clear the map's leaflet ID to prevent errors
    }

    // Initialize a new map instance
    const map = L.map(mapId, {
        dragging: true,
        touchZoom: true,
        tap: true
    }).setView([39.938806, -82.972361], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Define the source and destination projections
    const EPSG3857 = 'EPSG:3857';
    const EPSG4326 = 'EPSG:4326';

    // Configure proj4 with the EPSG:3857 and EPSG:4326 projections
    proj4.defs(EPSG3857, "+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=27445 +datum=WGS84 +units=m +no_defs");
    proj4.defs(EPSG4326, "+proj=longlat +datum=WGS84 +no_defs");

    const projectToEPSG4326 = (coordinates) => {
        return coordinates.map(coord => {
            // Convert each coordinate from EPSG:3857 to EPSG:4326
            const [x, y] = coord;
            return proj4(EPSG3857, EPSG4326, [x, y]).reverse();
        });
    };

    // Helper function to parse WKT format
    const parsePolygon = (polygonString) => {
        // Expected format: "POLYGON ((lng lat, lng lat, ...))"
        return polygonString
            .replace("POLYGON ((", "")
            .replace("))", "")
            .split(", ")
            .map(coord => coord.split(" ").map(Number)); // Convert to [lat, lng]
    };

    // Initialize a layer group for households at the top level so it can be modified later
    const householdLayer = L.layerGroup().addTo(map);

    // Function to render households
    function render_households(newHouseholds, newStores) {
        householdLayer.clearLayers(); // Clear the existing households from the layer

        newHouseholds.forEach((household, index) => {
            const positions = projectToEPSG4326(parsePolygon(household["Geometry"]));

            const polygon = L.polygon(positions, {
                color: household["Color"],
                weight: 3
            });

            const table = document.createElement("table");
            const tbody = document.createElement("tbody");

            const labels = [
                "Income",
                "Household Size",
                "Vehicles",
                "Number of Workers",
                "Stores within 1 Mile",
                "Closest Store (Miles)",
                "Transit time",
                "Food Access Score"
            ];

            labels.forEach(label => {
                const tr = document.createElement("tr");
                const td = document.createElement("td");
                td.textContent = `${label}: ${household[label] || "N/A"}`;
                tr.appendChild(td);
                tbody.appendChild(tr);
            });

            table.appendChild(tbody);
            polygon.bindPopup(table);

            householdLayer.addLayer(polygon);
        });

        newStores.forEach((store, index) => {
            const positions = projectToEPSG4326(parsePolygon(store[1]));

            const polygon = L.polygon(positions, {
                color: "blue",
                weight: 3
            });

            const table = document.createElement("table");
            const tbody = document.createElement("tbody");

            const tr1 = document.createElement("tr");
            const td1 = document.createElement("td");
            td1.textContent = `Name: ${store[2]}`;
            tr1.appendChild(td1);
            tbody.appendChild(tr1);

            const tr2 = document.createElement("tr");
            const td2 = document.createElement("td");
            td2.textContent = `Type: ${store[0]}`;
            tr2.appendChild(td2);
            tbody.appendChild(tr2);

            table.appendChild(tbody);
            polygon.bindPopup(table);

            householdLayer.addLayer(polygon);
        });
    }

    // Render the initial households
    render_households(households,stores);

    // Return the map and the render_households function so it can be called externally if needed
    return { map, render_households };
}
