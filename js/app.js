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