// Import necessary modules
import React from 'react';
import { Placeholder } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MyMapComponent = () => {
  return (
    <div style={{ height: '75vh', width: '75vh' }}> {/* Set desired height and width */}
        <MapContainer center={[40, -82.92]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[40, -82.92]}>
            <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
        </Marker>
        </MapContainer>
    </div>
  );
};

export default MyMapComponent;
