var Zombie = {
  map: null,
  marker: null,
  route: null
}

Zombie.init = function(lat, lng) {
  Zombie.map = new google.maps.Map(document.getElementById("map"), {
    center: {
      lat: lat,
      lng: lng
    },
    zoom: 18,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  Zombie.marker = new google.maps.Marker({
    map: Zombie.map,
    icon:"http://maps.google.com/mapfiles/ms/micons/blue.png"
  });

  Zombie.route = new google.maps.Polyline({
    path: [],
    geodesic : true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2,
    editable: false,
    map: Zombie.map
  });
};

Zombie.moveMarker = function(lat, lng) {
  var latlng = new google.maps.LatLng(lat, lng);
  Zombie.marker.setPosition(latlng);
  Zombie.route.getPath().push(latlng);
  Zombie.map.panTo(latlng);
}

Zombie.startGame = function(lat, lng) {
  Zombie.moveMarker(lat, lng)
};
