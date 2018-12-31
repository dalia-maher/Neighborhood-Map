/* model */

var map;

// Create a new blank array for all the listing markers.
var markers = [];

var Neighborhood = function(data) {

    var self = this;

    self.name = data.name;
    self.location = data.location;
    self.info = data.info;

    self.marker = new google.maps.Marker({
        map: map,
        position: self.location
    });
};

function initMap() {
	// Constructor creates a new map - only center and zoom are required.
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 40.7413549, lng: -73.9980244},
		zoom: 13
	});

    // Adding markers from locations.js file to the markers array
    for (var i = 0; i < locations.length; i++) {
        markers.push(new Neighborhood(locations[i]));
    }
}
