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
  $('#map, #panorama').height($(window).height() - 100)
  var styles = [{"featureType":"all","elementType":"all","stylers":[{"visibility":"simplified"},{"saturation":"-100"},{"invert_lightness":true},{"lightness":"11"},{"gamma":"1.27"}]},{"featureType":"administrative.locality","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"hue":"#ff0000"},{"visibility":"simplified"},{"invert_lightness":true},{"lightness":"-10"},{"gamma":"0.54"},{"saturation":"45"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"simplified"},{"hue":"#ff0000"},{"saturation":"75"},{"lightness":"24"},{"gamma":"0.70"},{"invert_lightness":true}]},{"featureType":"poi.government","elementType":"all","stylers":[{"hue":"#ff0000"},{"visibility":"simplified"},{"invert_lightness":true},{"lightness":"-24"},{"gamma":"0.59"},{"saturation":"59"}]},{"featureType":"poi.medical","elementType":"all","stylers":[{"visibility":"simplified"},{"invert_lightness":true},{"hue":"#ff0000"},{"saturation":"73"},{"lightness":"-24"},{"gamma":"0.59"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"lightness":"-41"}]},{"featureType":"poi.school","elementType":"all","stylers":[{"visibility":"simplified"},{"hue":"#ff0000"},{"invert_lightness":true},{"saturation":"43"},{"lightness":"-16"},{"gamma":"0.73"}]},{"featureType":"poi.sports_complex","elementType":"all","stylers":[{"hue":"#ff0000"},{"saturation":"43"},{"lightness":"-11"},{"gamma":"0.73"},{"invert_lightness":true}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":"45"},{"lightness":"53"},{"gamma":"0.67"},{"invert_lightness":true},{"hue":"#ff0000"},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"simplified"},{"hue":"#ff0000"},{"saturation":"38"},{"lightness":"-16"},{"gamma":"0.86"}]}]
  var styledMap = new google.maps.StyledMapType(styles, {name: "Zombie"});
  Zombie.map = new google.maps.Map(document.getElementById("map"), {
    center: new google.maps.LatLng(lat, lng),
    zoom: 18,
    icon: '/images/patient-zero-marker.png',
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
    }
  });
  Zombie.map.mapTypes.set('map_style', styledMap);
  Zombie.map.setMapTypeId('map_style');

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
      // console.log(data.action, data)
      if(data.action == 'move_target') {
        Zombie.moveMarker(data.lat, data.long);
      } else if(data.action == 'update_horde') {
        // moving horde!
        // trying to update a editable horde
        if(Zombie.hordes[data.horde.id].editing) {
          return
        }

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
          mapObject: null,
          editing: false
        };
        Zombie.addZombieHorde(Zombie.hordes[data.horde.id]);
      }
    }
  });
};

Zombie.addZombieHordeFromDB = function(horde) {
  Zombie.hordes[horde.id] = {
    id: horde.id,
    lat: horde.lat,
    long: horde.long,
    radius: horde.radius,
    mapObject: null,
    editing: false
  };
  Zombie.addZombieHorde(Zombie.hordes[horde.id]);
};

Zombie.moveMarker = function(lat, lng) {
  var latlng = new google.maps.LatLng(lat, lng);
  Zombie.marker.setPosition(latlng);
  Zombie.route.getPath().push(latlng);
}

Zombie.startGame = function(lat, lng) {
  Zombie.moveMarker(lat, lng)
};

Zombie.addZombieHorde = function(horde) {
  if(horde.id == 0) {
    var center = Zombie.map.getCenter()
    var radius = 10;
    var editable = true;
    var color = '#00C000'
  }
  else {
    var center = new google.maps.LatLng(horde.lat, horde.long);
    var radius = horde.radius;
    var editable = false;
    var color = '#831BE5';
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
        strokeColor:'#831BE5',
        fillColor: '#831BE5',
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
        strokeColor:'#00C000',
        fillColor: '#00C000',
        draggable: true
      });
    }
    horde.editing = !hordeMapCircle.editable;
    hordeMapCircle.setEditable(!hordeMapCircle.editable)
  });
};

Zombie.move_horde_map_object = function(hordeMapCircle) {
  var horde = $(hordeMapCircle).data('horde')
  if(horde.id == 0) {
    return
  }

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
