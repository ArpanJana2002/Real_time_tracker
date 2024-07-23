const socket = io();

if(navigator.geolocation){
    navigator.geolocation.watchPosition((position)=>{
        const {latitude, longitude} = position.coords;
        socket.emit("send-location", {latitude, longitude});
    },
    (error)=>{
        console.error(error);
    },
    {
        enableHighAccuracy: true, // Request high accuracy
        timeout: 5000, // Wait at most 5 seconds for a location
        maximumAge: 0 // Do not use a cached position
    });
}

const map = L.map('map').setView([0, 0], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: "OpenStreetMap"
}).addTo(map);

const markers = {};

socket.on("receive-location", function(data) {
    const { id, latitude, longitude } = data;

    if (markers[id]) {
        // Update existing marker position
        markers[id].setLatLng([latitude, longitude]);
    } else {
        // Create a new marker
        const marker = L.marker([latitude, longitude]).addTo(map);
        markers[id] = marker;
    }

    // Optionally, set the map view to the new location
    map.setView([latitude, longitude], 10);
});

socket.on("user-disconnected", function(id) {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});