import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import proj4 from 'proj4';
import 'proj4leaflet';
import '../../markercluster/leaflet.markercluster-src.js'

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
        // More robustly finds coordinates within "POLYGON ((...))"
        const coordsStr = polygonString.match(/\(\((.*)\)\)/);
        if (!coordsStr || !coordsStr[1]) return []; // Return empty array if no match
        return coordsStr[1].split(",").map(pair =>
            pair.trim().split(/\s+/).map(Number)
        );
    };

    // Helper function to parse WKT point format
    const parsePoint = (pointString) => {
        // More robustly finds coordinates within "POINT (...)"
        const coordsStr = pointString.match(/\((.*)\)/);
        if (!coordsStr || !coordsStr[1]) return []; // Return empty array if no match
        return coordsStr[1].trim().split(/\s+/).map(Number);
    };

    // Initialize a layer group for households at the top level so it can be modified later
    const householdLayer = L.layerGroup().addTo(map);
    const CLUSTER_STORES = false;
    const CLUSTER_HOUSEHOLDS = true;
    const CLUSTER_OPTIONS = {
        disableClusteringAtZoom: 16
    };

    //
    // icons
    //

    const icons = {
        convenience: getMapIcon('convenience-store.svg', 'transparent-shadow.svg'),
        supermarket: getMapIcon('supermarket.svg', 'transparent-shadow.svg'),
        dot: getMapIcon('dot.svg', 'shadow.svg'),
        house: getMapIcon('house.svg', 'shadow.svg'),
        green_house: getMapIcon('house-green.svg', 'shadow.svg'),
        yellow_house: getMapIcon('house-yellow.svg', 'shadow.svg'),
        red_house: getMapIcon('house-red.svg', 'shadow.svg')
    };

    //
    // icon rendering functions
    //

    function getMapIcon(iconUrl, shadowUrl) {
        return L.icon({
            iconUrl: '/markers/' + iconUrl,
            shadowUrl: '/markers/' + shadowUrl,
            iconSize:     [15, 15], // size of the icon
            shadowSize:   [30, 30], // size of the shadow
            iconAnchor:   [7.5, 7.5], // point of the icon which will correspond to marker's location
            shadowAnchor: [12, 12],  // the same for the shadow
            popupAnchor:  [0, -5] // point from which the popup should open relative to the iconAnchor
        });
    }

    //
    // store rendering functions
    //

    function getStoreIcon(store) {
        switch (store) {
            case 'convenience':
                return icons.convenience;
            case 'supermarket':
                return icons.supermarket;
            default:
                return icons.dot;
        }
    }

    function getStorePopup(store) {
        const table = document.createElement("table");
        const tbody = document.createElement("tbody");

        // create first row
        //
        const tr1 = document.createElement("tr");
        const td1 = document.createElement("td");
        td1.textContent = `Name: ${store[2]}`;
        tr1.appendChild(td1);
        tbody.appendChild(tr1);

        // create second row
        //
        const tr2 = document.createElement("tr");
        const td2 = document.createElement("td");
        td2.textContent = `Type: ${store[0]}`;
        tr2.appendChild(td2);
        tbody.appendChild(tr2);

        table.appendChild(tbody);
        return table;
    }

    function renderStore(store, layer) {
        const array = parsePolygon(store[1]);
        const point = array[0];
        const position = proj4(EPSG3857, EPSG4326, point).reverse();
        const icon = getStoreIcon(store[0]);

        // add marker to layer
        //
        L.marker(position, {icon: icon}).addTo(layer).bindPopup(getStorePopup(store));
    }

    function renderStores(stores, layer, limit=0) {
        stores.forEach((store, index) => {
            if (!limit || index < limit) {
                renderStore(store, layer);
            }
        });
    }

    //
    // store polygon rendering functions
    //

    function renderPolygonStore(store, layer) {
        const positions = projectToEPSG4326(parsePolygon(store[1]));
        const polygon = L.polygon(positions, {
            color: "blue",
            weight: 3
        });

        polygon.addTo(layer).bindPopup(getStorePopup(store));
    }

    function renderPolygonStores(stores, layer) {
        stores.forEach((store, index) => {
            if (index < limit) {
                renderPolygonStore(store, layer);
            }
        });
    }

    //
    // household rendering functions
    //

    function getHouseholdIcon(household) {
        const score = household['Food Access Score'];
        if (score < 50) {
            return icons.red_house;
        } else if (score < 75) {
            return icons.yellow_house;
        } else {
            return icons.green_house;
        }
    }

    function getHouseholdPopup(household) {
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
            const value = household? household[label] : "N/A";
            td.textContent = `${label}: ${value}`;
            tr.appendChild(td);
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        return table;
    }

    function renderHousehold(household, layer) {
        const position = projectToEPSG4326([parsePoint(household["Geometry"])]);
        const point = L.circleMarker(position[0], {
            color: household["Color"] || 'blue',
            weight: 3
        });
        const icon = getHouseholdIcon(household);

        // add marker to layer
        //
        L.marker(position[0], {icon: icon}).addTo(layer).bindPopup(getHouseholdPopup(household));
    }

    function renderHouseholds(households, layer, limit=0) {
        households.forEach((household, index) => {
            if (!limit || index < limit) {
                renderHousehold(household, layer);
            }
        });
    }

    //
    // marker rendering function
    //

    function renderAll(newHouseholds, newStores) {
        householdLayer.clearLayers(); // Clear the existing households from the layer

        // render households
        //
        if (CLUSTER_HOUSEHOLDS) {
            let clusterLayer = L.markerClusterGroup(CLUSTER_OPTIONS);
            renderHouseholds(newHouseholds, clusterLayer);
            householdLayer.addLayer(clusterLayer);
        } else {
            renderHouseholds(newStores, householdLayer);
        }

        // render stores
        //
        if (CLUSTER_STORES) {
            let clusterLayer = L.markerClusterGroup(CLUSTER_OPTIONS);
            renderStores(newStores, clusterLayer);
            householdLayer.addLayer(clusterLayer);
        } else {
            renderStores(newStores, householdLayer);
        }
    }

    // Render the initial households and stores
    //
    renderAll(households, stores);

    // Return the map and the render_households function so it can be called externally if needed
    return { map, renderAll };
}
