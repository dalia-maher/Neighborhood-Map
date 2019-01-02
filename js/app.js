/* model */

var map;

// Create a new blank array for all the listing markers.
var markers = [];
var largeInfowindow;

function ViewModel() {
    this.searchText = ko.observable("");
    var self = this;

    this.locations = ko.computed(function() {
        var result = [];
        markers.forEach(function(marker) {
            if (marker.title.toLowerCase()
                .includes(self.searchText().toLowerCase())) {
                result.push(marker);
                marker.setVisible(true);
            } else {
                marker.setVisible(false);
            }
        });
        return result;
    }, this);
}

var Neighborhood = function(data) {

    this.title = data.title;
    this.location = data.location;
	this.info = data.info;

    var marker = new google.maps.Marker({
        position: data.location,
        title: data.title,
		info: data.info,
        map: map,
        animation: google.maps.Animation.DROP
    });

    this.marker = marker;

    this.setVisible = function(v) {
        this.marker.setVisible(v);
    };
	
	this.marker.addListener('click', function() {
		populateInfoWindow(this, largeInfowindow);
	});

    this.viewLocationInfo = function() {
        google.maps.event.trigger(this.marker, 'click');
    };
};

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
	// Check to make sure the infowindow is not already opened on this marker.
	if (infowindow.marker != marker) {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){ marker.setAnimation(null); }, 2000);
		
		// Clear the infowindow content to give the streetview time to load.
		infowindow.setContent('');
		infowindow.marker = marker;
		// Make sure the marker property is cleared if the infowindow is closed.
		infowindow.addListener('closeclick', function() {
			infowindow.marker = null;
			marker.setAnimation(null);
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
				infowindow.setContent('<div id="marker-title"><h4>' + marker.title +
					'</h4></div><div id="infobox"><p>' + marker.info +
					'</p></div><div id="pano"></div><div id="articles"></div>');
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

		// Get WikipediaArticles to be populated in the info window
		getWikiArticles(marker, infowindow);

		// Open the infowindow on the correct marker.
		infowindow.open(map, marker);
	}
}

function getWikiArticles(marker, infowindow) {

	// setting up wikipedia url for API
	var wikipediaUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&search=" +
		marker.title + "&format=json&callback=wikiCallback";
	$.ajax({
		url: wikipediaUrl,
		dataType: "jsonp"
	}).done(function(response) {
		console.log(response);
		var articles = response[1];
		var articleUrls = response[3];
		if (articles != null && articles.length > 0) {
			var content = '<h4>Wikipedia Articles:</h4><ul>';
			for (var i = 0; i < articles.length; i++) {
				var articleName = articles[i];
				var url = articleUrls[i];
				content += '<li><a href="' + url + '">' + articleName + '</a></li>';
			}
			content += '</ul>';
			$('#articles').html(content);
		} else {
			$('#articles').html('<div class="alert alert-warning">No articles found from Wikipedia.</div>')
		}
	}).fail(function(e) {
        $('#articles').html('<div class="alert alert-danger">Failed to get articles from Wikipedia!</div>');
	});
}

function initMap() {
	// Constructor creates a new map - only center and zoom are required.
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 40.7413549,
			lng: -73.9980244
		},
		zoom: 13
	});

	largeInfowindow = new google.maps.InfoWindow();

    // Adding markers from locations.js file to the markers array
    for (var i = 0; i < locations.length; i++) {
        markers.push(new Neighborhood(locations[i]));
    }
    ko.applyBindings(new ViewModel());
}

function showMapsLoadingError() {
    $('#map').html('An error occurred while loading Google Maps!');
}
