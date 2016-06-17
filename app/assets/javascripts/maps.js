var Zombie = {
  map: null,
  marker: null,
  destinationMarker: null,
  route: null,
  cable: ActionCable.createConsumer(),
  cable_channel: null,
  hordes: {}
};

Zombie.init = function(lat, lng) {
  Zombie.map = new google.maps.Map(document.getElementById("map"), {
    center: new google.maps.LatLng(lat, lng),
    zoom: 18,
    icon: '/images/patient-zero-marker.png'
  });

  Zombie.marker = new google.maps.Marker({
    map: Zombie.map,
    icon: '/images/location-marker.png'
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

  Zombie.cable_channel = Zombie.cable.subscriptions.create('MessagesChannel', {
    received: function(data) {
      // Possible 'action'
      // - move_target
      // - create_horde
      // - update_horde
      if(data.action == 'move_target') {
        Zombie.moveMarker(data.lat, data.long);
      } else if(data.action == 'update_horde') {
        // moving horde!
        var position = new google.maps.LatLng(data.horde.lat, data.horde.long);
        Zombie.hordes[data.horde.id].mapObject.setCenter(position);
        Zombie.hordes[data.horde.id].mapObject.setRadius(data.horde.radius);
      } else if(data.action == 'create_horde') {
        // add new horde!
        Zombie.hordes[data.horde.id] = {
          id: data.horde.id,
          lat: data.horde.lat,
          long: data.horde.long,
          radius: data.horde.radius,
          mapObject: null
        };
        Zombie.addZombieHorde(Zombie.hordes[data.horde.id]);
        // Zombie.createHorde(data);
      }
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

Zombie.createHorde = function(data) {
  // create horde
  console.log(data);
};

Zombie.addZombieHorde = function(horde) {
  if(horde.id == 0) {
    var center = Zombie.map.getCenter()
    var radius = 10;
    var editable = true;
    var color = '#514A44'
  }
  else {
    var center = new google.maps.LatLng(horde.lat, horde.long);
    var radius = horde.radius;
    var editable = false;
    var color = '#FF0000';
  }
  var hordeMapCircle = new google.maps.Circle({
    strokeColor: color,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: color,
    fillOpacity: 0.35,
    map: Zombie.map,
    center: center,
    radius: radius,
    draggable: editable,
    editable: editable
  });

  $(hordeMapCircle).data('horde', horde);
  horde.mapObject = hordeMapCircle;

  google.maps.event.addListener(hordeMapCircle, 'drag', function() {
    Zombie.move_horde_map_object(hordeMapCircle)
  });

  google.maps.event.addListener(hordeMapCircle, 'click', function() {
    var horde = $(hordeMapCircle).data('horde')
    if(hordeMapCircle.editable) {
      // active colors
      hordeMapCircle.setOptions({
        strokeColor:'#FF0000',
        fillColor: '#FF0000',
        draggable: false
      });
      // finished editing/creating
      var object = {
        id: horde.id,
        lat: hordeMapCircle.getCenter().lat(),
        long: hordeMapCircle.getCenter().lng(),
        radius: hordeMapCircle.getRadius(),
      };
      if(horde.id == 0) {
        // create
        Zombie.cable_channel.perform('create_horde', object)
        hordeMapCircle.setMap(null)
      } else {
        // update
        Zombie.cable_channel.perform('update_horde', object)
      }
    } else {
      // editable colors
      hordeMapCircle.setOptions({
        strokeColor:'#514A44',
        fillColor: '#514A44',
        draggable: true
      });
    }
    hordeMapCircle.setEditable(!hordeMapCircle.editable)
    // hordeMapCircle.setDragable(!hordeMapCircle.dragable)
  });
};

Zombie.move_horde_map_object = function(hordeMapCircle) {
  var horde = $(hordeMapCircle).data('horde')
  if(horde.id == 0) {
    return
  }
  // this is the shit
  // console.table($(hordeMapCircle).data('horde'));
  var object = {
    id: horde.id,
    lat: hordeMapCircle.getCenter().lat(),
    long: hordeMapCircle.getCenter().lng(),
    radius: hordeMapCircle.getRadius()
  }
  Zombie.cable_channel.perform('move_horde', object);
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
    icon: '/images/patient-zero-marker.png'
  });

  if(editable) {
    google.maps.event.addListener(Zombie.destinationMarker, 'dragend', function() {
      position = Zombie.destinationMarker.getPosition();

      $('#game_lat').val(position.lat());
      $('#game_long').val(position.lng());
    });
  }
}
