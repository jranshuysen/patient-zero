var Zombie = {
  map: null,
  marker: null,
  destinationMarker: null,
  route: null,
  cable: ActionCable.createConsumer()
};

Zombie.init = function(lat, lng) {
  Zombie.map = new google.maps.Map(document.getElementById("map"), {
    center: new google.maps.LatLng(lat, lng),
    zoom: 18,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  Zombie.marker = new google.maps.Marker({
    map: Zombie.map,
    icon:"http://maps.google.com/mapfiles/ms/micons/blue.png"
  });

  Zombie.route = new google.maps.Polyline({
    path: [], // nice to have, fetch locations already saved
    geodesic : true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2,
    editable: false,
    map: Zombie.map
  });

  Zombie.cable.subscriptions.create('MessagesChannel', {
    received: function(data) {
      Zombie.moveMarker(data.lat, data.long);
    }
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

Zombie.addZombieHorde = function(position) {
  position = Zombie.map.getCenter();
  var horde = new google.maps.Circle({
    strokeColor: '#514A44',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#514A44',
    fillOpacity: 0.35,
    map: Zombie.map,
    center: position,
    radius: 10,
    draggable: true,
    editable: true
  });

  google.maps.event.addListener(horde, 'dragend', function() {
    // this is the shit
    console.table(horde);
  });
  google.maps.event.addListener(horde, 'click', function() {
    if(horde.editable) {
      // active colors
      horde.setOptions({
        strokeColor:'#FF0000',
        fillColor: '#FF0000'
      });
    } else {
      // editable colors
      horde.setOptions({
        strokeColor:'#514A44',
        fillColor: '#514A44'
      });
    }
    horde.setEditable(!horde.editable)
  });
}

Zombie.placeDestinationMarker = function(editable=false, lat=0, lng=0) {
  var position = Zombie.map.getCenter()
  if(lat != 0 && lng != 0) {
    position = new google.maps.LatLng(lat, lng);
  }

  Zombie.destinationMarker = new google.maps.Marker({
    map: Zombie.map,
    draggable: editable,
    animation: google.maps.Animation.DROP,
    position: position,
    icon: "http://maps.google.com/mapfiles/ms/micons/red.png",
  });

  if(editable) {
    google.maps.event.addListener(Zombie.destinationMarker, 'dragend', function() {
      position = Zombie.destinationMarker.getPosition();

      $('#game_lat').val(position.lat());
      $('#game_long').val(position.lng());
    });
  }
}
