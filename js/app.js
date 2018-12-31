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

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
	// Check to make sure the infowindow is not already opened on this marker.
	if (infowindow.marker == marker) {
		// Clear the infowindow content to give the streetview time to load.
		infowindow.setContent('');
		infowindow.marker = marker;
		// Make sure the marker property is cleared if the infowindow is closed.
		infowindow.addListener('closeclick', function() {
			infowindow.marker = null;
		});
		var streetViewService = new google.maps.StreetViewService();
		var radius = 50;
		// In case the status is OK, which means the pano was found, compute the
		// position of the streetview image, then calculate the heading, then get a
		// panorama from that and set the options
		function getStreetView(data, status) {
			if (status == google.maps.StreetViewStatus.OK) {
				var nearStreetViewLocation = data.location.latLng;
				var heading = google.maps.geometry.spherical.computeHeading(
					nearStreetViewLocation, marker.position);
				infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
				var panoramaOptions = {
					position: nearStreetViewLocation,
					pov: {
						heading: heading,
						pitch: 30
					}
				};
				var panorama = new google.maps.StreetViewPanorama(
					document.getElementById('pano'), panoramaOptions);
			} else {
				infowindow.setContent('<div>' + marker.title + '</div>' +
					'<div>No Street View Found</div>');
			}
		}
		// Use streetview service to get the closest streetview image within
		// 50 meters of the markers position
		streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
		// Open the infowindow on the correct marker.
		infowindow.open(map, marker);
	}
}

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

function showMapsLoadingError() {
    $('#map').html('An error occurred while loading Google Maps!');
}
