// Create map variable
var map;

// Create a new blank array for all the listing markers.
var markers = [];
// Create infowindow to hold marker's info
var largeInfowindow;

/* View Model */

function ViewModel() {
    this.searchText = ko.observable("");
    var self = this;

    this.locations = ko.computed(function() {
        var result = [];
		// Filter markers depending on user's input search text
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

/* View Model */

var Neighborhood = function(data) {

    this.title = data.title;
    this.location = data.location;
	this.info = data.info;

	// Create marker for each location in the array
    var marker = new google.maps.Marker({
        position: data.location,
        title: data.title,
		info: data.info,
        map: map,
        animation: google.maps.Animation.DROP
    });

    this.marker = marker;

	// Set visibility of the marker
    this.setVisible = function(v) {
        this.marker.setVisible(v);
    };
	
	// Show infowindow once the marker is clicked
	this.marker.addListener('click', function() {
		populateInfoWindow(this, largeInfowindow);
	});

	// Trigger the click event to show the infowindow once the item in the list is clicked
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

		// Get Wikipedia Articles to be populated in the infowindow
		getWikiArticles(marker, infowindow);

		// Open the infowindow on the correct marker.
		infowindow.open(map, marker);
	}
}

// This function gets the Wikipedia article using AJAX call and Wikipedia API. It
// gets related articles for certain markers using their titles and display them 
// in the marker's infowindow.
function getWikiArticles(marker, infowindow) {

	// Setting up Wikipedia url of the API
	var wikipediaUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&search=" +
		marker.title + "&format=json&callback=wikiCallback";
	$.ajax({
		url: wikipediaUrl,
		dataType: "jsonp"
	}).done(function(response) {
		// Get the article names from the response
		var articles = response[1];
		// Get the article URLs from the response
		var articleUrls = response[3];
		if (articles != null && articles.length > 0) {
			var content = '<h4>Wikipedia Articles:</h4><ul>';
			// Add the content of the articles to the infowindow of the specified marker
			for (var i = 0; i < articles.length; i++) {
				var articleName = articles[i];
				var url = articleUrls[i];
				content += '<li><a href="' + url + '">' + articleName + '</a></li>';
			}
			content += '</ul>';
			$('#articles').html(content);
		} else {
			// Add a message to the infowindow of the specified marker if no articles are found
			$('#articles').html('<div class="alert alert-warning">No articles found from Wikipedia.</div>')
		}
	}).fail(function(e) {
		// Add a message to the infowindow of the specified marker if an error occurred while
		// retrieving the articles
        $('#articles').html('<div class="alert alert-danger">Failed to get articles from Wikipedia!</div>');
	});
}

// This function initializes the map, the infowindow and populates the
// markers array from the locations array. It also apply the bindings needed 
// to the View Model.
function initMap() {
	// Constructor creates a new map - only center and zoom are required.
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 40.7413549,
			lng: -73.9980244
		},
		zoom: 13
	});

	// Construct the infowindow
	largeInfowindow = new google.maps.InfoWindow();

    // Adding markers from locations.js file to the markers array
    for (var i = 0; i < locations.length; i++) {
        markers.push(new Neighborhood(locations[i]));
    }
	// Apply Bindings to the View Model
    ko.applyBindings(new ViewModel());
}

// This function shows an error message if an error occurred while loading
// the Google Maps.
function showMapsLoadingError() {
    $('#map').html('An error occurred while loading Google Maps!');
}
