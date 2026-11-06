// Where the map starts before a simulation is loaded. Each deployment sets its
// own center in .env.production / .env.staging (the build picks the file by
// mode), using the same CENTER_LAT / CENTER_LON its backend stores with every
// simulation, so the map doesn't jump when one loads. Once a simulation loads,
// App.jsx recenters on the center stored with it.
const FALLBACK_CENTER = [44.519356, -88.019826]; // Brown County, Wisconsin (Green Bay area)

export function defaultMapCenter(env = import.meta.env) {
    const lat = Number.parseFloat(env.VITE_MAP_CENTER_LAT);
    const lon = Number.parseFloat(env.VITE_MAP_CENTER_LON);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
        return [lat, lon];
    }
    return [...FALLBACK_CENTER];
}
