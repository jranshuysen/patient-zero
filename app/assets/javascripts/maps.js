var Zombie = {
  map: null,
  marker: null,
  destinationMarker: null,
  cdcMarker: null,
  route: null,
  cable: ActionCable.createConsumer(),
  cable_channel: null,
  found: false,
  hordes: {}
};

Zombie.init = function(lat, lng, found, started) {
  $('#canvas').hide()
  Zombie.found = found;
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

  if(started) {
    Zombie.cable_channel = Zombie.cable.subscriptions.create('MessagesChannel', {
      received: function(data) {
        // Possible 'action'
        // - move_target
        // - create_horde
        // - update_horde
        // - game_target_found
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
        } else if(data.action == 'game_target_found') {
          Zombie.found = true;
        } else if(data.action == 'game_finished') {
          // finished
          Zombie.finished()
        }
      }
    });
  }
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
  if(Zombie.found) {
    // if destination found, move it with the marker
    latlng = new google.maps.LatLng(lat+0.00001650679191, lng+0.00002145767212);
    Zombie.destinationMarker.setPosition(latlng);
  }
}

Zombie.startGame = function(locations) {
  for(var i=0; i<locations.length; i++) {
    var loc = locations[i]
    Zombie.moveMarker(loc.lat, loc.long)
  }
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

Zombie.placeDestinationMarker = function(editable, lat, lng) {
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
  // initial setting value
  $('#game_lat').val(position.lat());
  $('#game_long').val(position.lng());
};

Zombie.placeCDCMarker = function(editable, lat, lng) {
  var position = new google.maps.LatLng(52.017706476140745, 4.353017857424902);
  if(lat != 0 && lng != 0) {
    position = new google.maps.LatLng(lat, lng);
  }

  Zombie.cdcMarker = new google.maps.Marker({
    map: Zombie.map,
    draggable: editable,
    animation: google.maps.Animation.DROP,
    position: position,
    icon: '/images/cdc-marker.png'
  });

  if(editable) {
    google.maps.event.addListener(Zombie.cdcMarker, 'dragend', function() {
      position = Zombie.cdcMarker.getPosition();

      $('#game_cdc_lat').val(position.lat());
      $('#game_cdc_long').val(position.lng());
    });
    // initial setting value
    $('#game_cdc_lat').val(position.lat());
    $('#game_cdc_long').val(position.lng());
  }
};

Zombie.finished = function() {
  $('#canvas').show()
  $('.btn').hide()
  // Local variables
  var fireworks = [];
  var particles = [];
  var mouse = {down: false, x: 0, y: 0};
  var currentHue = 120;
  var clickLimiterTotal = 10;
  var clickLimiterTick = 0;
  var timerTotal = 10;
  var timerTick = 0;

  // Helper function for canvas animations
  window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function(cb) {
        window.setTimeout(callback, 1000 / 60);
      }
  })();

  // Helper function to return random numbers within a specified range
  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Helper function to calculate the distance between 2 points
  function calculateDistance(p1x, p1y, p2x, p2y) {
    var xDistance = p1x - p2x;
    var yDistance = p1y - p2y;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
  }

  // Setup some basic variables
  var canvas = document.getElementById('canvas');
  var canvasCtx = canvas.getContext('2d');
  var canvasWidth = window.innerWidth;
  var canvasHeight = window.innerHeight;

  // Resize canvas
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Firework class
  function Firework(sx, sy, tx, ty) {
    // Set coordinates (x/y = actual, sx/sy = starting, tx/ty = target)
    this.x = this.sx = sx;
    this.y = this.sy = sy;
    this.tx = tx; this.ty = ty;

    // Calculate distance between starting and target point
    this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
    this.distanceTraveled = 0;

    // To simulate a trail effect, the last few coordinates will be stored
    this.coordinates = [];
    this.coordinateCount = 3;

    // Populate coordinate array with initial data
    while(this.coordinateCount--) {
      this.coordinates.push([this.x, this.y]);
    }

    // Some settings, you can adjust them if you'd like to do so.
    this.angle = Math.atan2(ty - sy, tx - sx);
    this.speed = 2;
    this.acceleration = 1.03;
    this.brightness = random(50, 80);
    this.targetRadius = 1;
    this.targetDirection = false;  // false = Radius is getting bigger, true = Radius is getting smaller
  };

  // This method should be called each frame to update the firework
  Firework.prototype.update = function(index) {
    // Update the coordinates array
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);

    // Cycle the target radius (used for the pulsing target circle)
    if(!this.targetDirection) {
      if(this.targetRadius < 8)
        this.targetRadius += 0.15;
      else
        this.targetDirection = true;
    } else {
      if(this.targetRadius > 1)
        this.targetRadius -= 0.15;
      else
        this.targetDirection = false;
    }

    // Speed up the firework (could possibly travel faster than the speed of light)
    this.speed *= this.acceleration;

    // Calculate the distance the firework has travelled so far (based on velocities)
    var vx = Math.cos(this.angle) * this.speed;
    var vy = Math.sin(this.angle) * this.speed;
    this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

    // If the distance traveled (including velocities) is greater than the initial distance
    // to the target, then the target has been reached. If that's not the case, keep traveling.
    if(this.distanceTraveled >= this.distanceToTarget) {
      createParticles(this.tx, this.ty);
      fireworks.splice(index, 1);
    } else {
      this.x += vx;
      this.y += vy;
    }
  };

  // Draws the firework
  Firework.prototype.draw = function() {
    var lastCoordinate = this.coordinates[this.coordinates.length - 1];

    // Draw the rocket
    canvasCtx.beginPath();
    canvasCtx.moveTo(lastCoordinate[0], lastCoordinate[1]);
    canvasCtx.lineTo(this.x, this.y);
    canvasCtx.strokeStyle = 'hsl(' + currentHue + ',100%,' + this.brightness + '%)';
    canvasCtx.stroke();

    // Draw the target (pulsing circle)
    canvasCtx.beginPath();
    canvasCtx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
    canvasCtx.stroke();
  };

  // Particle class
  function Particle(x, y) {
    // Set the starting point
    this.x = x;
    this.y = y;

    // To simulate a trail effect, the last few coordinates will be stored
    this.coordinates = [];
    this.coordinateCount = 5;

    // Populate coordinate array with initial data
    while(this.coordinateCount--) {
      this.coordinates.push([this.x, this.y]);
    }

    // Set a random angle in all possible directions (radians)
    this.angle = random(0, Math.PI * 2);
    this.speed = random(1, 10);

    // Add some friction and gravity to the particle
    this.friction = 0.95;
    this.gravity = 1;

    // Change the hue to a random number
    this.hue = random(currentHue - 20, currentHue + 20);
    this.brightness = random(50, 80);
    this.alpha = 1;

    // Set how fast the particles decay
    this.decay = random(0.01, 0.03);
  }

  // Updates the particle, should be called each frame
  Particle.prototype.update = function(index) {
    // Update the coordinates array
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);

    // Slow it down (based on friction)
    this.speed *= this.friction;

    // Apply velocity to the particle
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;

    // Fade out the particle, and remove it if alpha is low enough
    this.alpha -= this.decay;
    if(this.alpha <= this.decay) {
      particles.splice(index, 1);
    }
  }

  // Draws the particle
  Particle.prototype.draw = function() {
    var lastCoordinate = this.coordinates[this.coordinates.length - 1];

    canvasCtx.beginPath();
    canvasCtx.moveTo(lastCoordinate[0], lastCoordinate[1]);
    canvasCtx.lineTo(this.x, this.y);
    canvasCtx.strokeStyle = 'hsla(' + this.hue + ',100%,' + this.brightness + '%,' + this.alpha + ')';
    canvasCtx.stroke();
  }

  // Create a bunch of particles at the given position
  function createParticles(x, y) {
    var particleCount = 30;
    while(particleCount--) {
      particles.push(new Particle(x, y));
    }
  }

  // Add an event listener to the window so we're able to react to size changes
  window.addEventListener('resize', function(e) {
    canvas.width = canvasWidth = window.innerWidth;
    canvas.height = canvasHeight = window.innerHeight;
  });

  // Add event listeners to the canvas to handle mouse interactions
  canvas.addEventListener('mousemove', function(e) {
    e.preventDefault();
    mouse.x = e.pageX - canvas.offsetLeft;
    mouse.y = e.pageY - canvas.offsetTop;
  });

  canvas.addEventListener('mousedown', function(e) {
    e.preventDefault();
    mouse.down = true;
  });

  canvas.addEventListener('mouseup', function(e) {
    e.preventDefault();
    mouse.down = false;
  });

  // Main application / script, called when the window is loaded
  function gameLoop() {
    // This function will rund endlessly by using requestAnimationFrame (or fallback to setInterval)
    requestAnimFrame(gameLoop);

    // Increase the hue to get different colored fireworks over time
    currentHue += 0.5;

    // 'Clear' the canvas at a specific opacity, by using 'destination-out'. This will create a trailing effect.
    canvasCtx.globalCompositeOperation = 'destination-out';
    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    canvasCtx.globalCompositeOperation = 'lighter';

    // Loop over all existing fireworks (they should be updated & drawn)
    var i = fireworks.length;
    while(i--) {
      fireworks[i].draw();
      fireworks[i].update(i);
    }

    // Loop over all existing particles (they should be updated & drawn)
    var i = particles.length;
    while(i--) {
      particles[i].draw();
      particles[i].update(i);
    }

    // Launch fireworks automatically to random coordinates, if the user does not interact with the scene
    if(timerTick >= timerTotal) {
      if(!mouse.down) {
        fireworks.push(new Firework(canvasWidth / 2, canvasHeight, random(0, canvasWidth), random(0, canvasHeight / 2)));
        timerTick = 0;
      }
    } else {
      timerTick++;
    }

    // Limit the rate at which fireworks can be spawned by mouse
    if(clickLimiterTick >= clickLimiterTotal) {
      if(mouse.down) {
        fireworks.push(new Firework(canvasWidth / 2, canvasHeight, mouse.x, mouse.y));
        clickLimiterTick = 0;
      }
    } else {
      clickLimiterTick++;
    }
  }

  gameLoop();
};
