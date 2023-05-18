const generateMap = (markers) => {
    const createMap = (userLocation) => {
        var map = L.map('map').setView([userLocation[0], userLocation[1]], 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        return map;
    }

    const placeMarker = (location, map) => {
        var marker = L.marker([location[0], location[1]]).addTo(map);

        return marker;
    }

    const createStarRating = function (Award) {
        let rating

        if (Award === "Bib Gourmand") {
            return "Bib Gourmand"
        } else {
            rating = parseInt(Award.charAt(0))
        }

        let starRating = "";

        for (let i = 0; i < rating; i++) {
            starRating += "★";
        }
        for (let i = 0; i < 3 - rating; i++) {
            starRating += "☆";
        }

        return starRating;
    }

    const addPopup = (markerLocation, restaurant) => {
        markerLocation.bindPopup(`
        <b>${restaurant.Name}</b> | ${createStarRating(restaurant.Award)}<br>
        ${restaurant.Cuisine}<br><br>
        <a href="/restaurant/${restaurant._id}">View Restaurant</a>`);
    }

    const createGenericMap = () => {
        var map = createMap([40.7128, -74.0060]);

        markers.map((marker) => {
            try {
                var markerLocation = placeMarker([marker.Latitude, marker.Longitude], map);
                addPopup(markerLocation, marker);
            } catch (err) {
                console.log(marker)
            }
        });
    }
    
    markers = JSON.parse(markers)

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (success, error) => {
            userLocation = [success.coords.latitude, success.coords.longitude]

            var map = createMap(userLocation);
            var marker = placeMarker(userLocation, map);
            marker.bindPopup("This is where you are!<br><br>Scroll around the map to find Michelin restaurants near you.")

            markers.map((marker) => {
                try {
                    var markerLocation = placeMarker([marker.Latitude, marker.Longitude], map);
                    addPopup(markerLocation, marker);
                } catch (err) {
                    console.log(marker)
                }
            });

        }, () => {
            createGenericMap();
        });
    } else {
        createGenericMap();
    }
};

$(document).ready(async () => {
    // console.log("Hello world")
});