const updateDirections = async (restaurantLatitude, restaurantLongitude) => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((success, error) => {

            const userLatitude = success.coords.latitude;
            const userLongitude = success.coords.longitude;

            const newLink = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLatitude}%2C${userLongitude}%3B${restaurantLatitude}%2C${restaurantLongitude}#map=15/${userLatitude}/${userLongitude}`

            $("#directionsButton a").attr("href", newLink);

            console.log(newLink);
        }, () => {
            console.log(error)
        });
    }
}