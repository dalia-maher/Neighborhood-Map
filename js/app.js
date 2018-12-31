/* model */

var neighborhood = function(data) {

    var self = this;

    self.name = data.name;
    self.location = data.location;
    self.info = data.info;

    self.marker = new google.maps.Marker({
        map: map,
        position: self.location
    });
};

var map;

// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
	// Constructor creates a new map - only center and zoom are required.
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 40.7413549, lng: -73.9980244},
		zoom: 13
	});
}
