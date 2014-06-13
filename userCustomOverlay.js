'use strict';

function USGSOverlay(bounds, image, map) {

	// Now initialize all properties.
	this.bounds_ = bounds;
	this.image_ = image;
	this.map_ = map;
	
	// We define a property to hold the image's
	// div. We'll actually create this div
	// upon receipt of the add() method so we'll
	// leave it null for now.
	this.div_ = null;	
	// Explicitly call setMap() on this overlay
	this.setMap(map);
	this.rectangle_ ;
	this.markerX_ ;
	this.oldCenter_;
	this.oldBounds_;
	
	google.maps.LatLng.prototype.Plus = function(A){		
		return new google.maps.LatLng(
			A.lat() + this.lat(),
			A.lng() + this.lng()
		);
	}
		
	google.maps.LatLng.prototype.Minus = function(A){
		return new google.maps.LatLng(
			this.lat() - A.lat(),
			this.lng() - A.lng()
		);
	}
  
}

USGSOverlay.prototype = new google.maps.OverlayView();

USGSOverlay.prototype.createRectangle = function () {

	var rectangle = new google.maps.Rectangle({
		strokeColor: "#FF0000",
		strokeOpacity: 0.8,
		strokeWeight: 2,
		bounds: this.bounds_,
		fillOpacity: 0,
		editable : true,
		map: this.map_
    });
	
	var center = rectangle.getBounds().getCenter();
	
	var imageX = new google.maps.MarkerImage(
		'X2.png',
		new google.maps.Size(18, 16),
		new google.maps.Point(0, 0),
		new google.maps.Point(9, 8)
	);
	
	this.markerX_ = new google.maps.Marker({
		map: this.map_,
		icon: imageX,
		draggable:true,
		title: 'center',
		position: center
	});	
	
	var that = this;
	
	new google.maps.event.addListener(this.markerX_, 'dragstart', function() {	
		that.oldCenter_ = this.getPosition();
		that.oldBounds_ = that.bounds_;
	});
	
	new google.maps.event.addListener(this.markerX_, 'click', function() {	
		that.onRemove();
	});
	
	new google.maps.event.addListener(this.markerX_, 'drag', function() {
	
		var delta  = that.markerX_.getPosition().Minus(that.oldCenter_);
		var start = that.oldBounds_.getSouthWest();		
		var end = that.oldBounds_.getNorthEast();		
		var bounds = new google.maps.LatLngBounds(start.Plus(delta), end.Plus(delta));	
		that.rectangle_.setBounds(bounds);
		
	});
	
	new google.maps.event.addListener(rectangle, 'bounds_changed', function() {	
	
		that.bounds_  = this.getBounds();
		that.markerX_.setPosition(this.getBounds().getCenter());
		that.draw();
		
		//code ooqia to update inputHidden
		if ($('#inputHiddenInterativeImgBounds').length > 0){
			$('#inputHiddenInterativeImgBounds').val(interactiveImgUserBackground.bounds_.toUrlValue());
		}
	});
	
	return rectangle;

}

USGSOverlay.prototype.onAdd = function() {

	// Note: an overlay's receipt of onAdd() indicates that
	// the map's panes are now available for attaching
	// the overlay to the map via the DOM.
	
	// Create the DIV and set some basic attributes.
	var div = document.createElement('div');
	div.setAttribute('id','imgUserOverlay');
	div.style.border = "none";
	div.style.borderWidth = "0px";
	div.style.position = "absolute";
	
	// Create an IMG element and attach it to the DIV.
	var img = document.createElement("img");
	img.src = this.image_;
	img.style.width = "100%";
	img.style.height = "100%";
	div.appendChild(img);
	
	// Set the overlay's div_ property to this DIV
	this.div_ = div;
	
	// We add an overlay to a map via one of the map's panes.
	// We'll add this overlay to the overlayImage pane.
	var panes = this.getPanes();
	panes.overlayLayer.appendChild(div);  
	
	this.rectangle_  = this.createRectangle();	
  
}


USGSOverlay.prototype.draw = function() {

  // Size and position the overlay. We use a southwest and northeast
  // position of the overlay to peg it to the correct position and size.
  // We need to retrieve the projection from this overlay to do this.
  var overlayProjection = this.getProjection();

  // Retrieve the southwest and northeast coordinates of this overlay
  // in latlngs and convert them to pixels coordinates.
  // We'll use these coordinates to resize the DIV.
  var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
  var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

  // Resize the image's DIV to fit the indicated dimensions.
  var div = this.div_;
  div.style.left = sw.x + 'px';
  div.style.top = ne.y + 'px';
  div.style.width = (ne.x - sw.x) + 'px';
  div.style.height = (sw.y - ne.y) + 'px';
 
}

USGSOverlay.prototype.UpdateDivSize = function() {
 
	// Size and position the overlay. We use a southwest and northeast
	// position of the overlay to peg it to the correct position and size.
	// We need to retrieve the projection from this overlay to do this.
	var overlayProjection = this.getProjection();
	
	// Retrieve the southwest and northeast coordinates of this overlay
	// in latlngs and convert them to pixels coordinates.
	// We'll use these coordinates to resize the DIV.
	var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
	var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
	
	// Resize the image's DIV to fit the indicated dimensions.
	var div = this.div_;
	div.style.left = sw.x + 'px';
	div.style.top = ne.y + 'px';
	div.style.width = (ne.x - sw.x) + 'px';
	div.style.height = (sw.y - ne.y) + 'px';
	
}

//method to remove overlay excute when you call , setMap(null) od overlayview
USGSOverlay.prototype.onRemove = function() {

	if(this.div_){
		this.div_.parentNode.removeChild(this.div_);
		this.div_ = null;
		this.rectangle_.setMap(null);
		this.markerX_.setMap(null);	
	}
	
  
}


// Note that the visibility property must be a string enclosed in quotes
USGSOverlay.prototype.hide = function() {
  if (this.div_) {
    this.div_.style.visibility = "hidden";
  }
}

USGSOverlay.prototype.show = function() {
  if (this.div_) {
    this.div_.style.visibility = "visible";
  }
}

USGSOverlay.prototype.toggle = function() {
  if (this.div_) {
    if (this.div_.style.visibility == "hidden") {
      this.show();
    } else {
      this.hide();
    }
  }
}
//this method will create , execute the method onAdd
USGSOverlay.prototype.toggleDOM = function() {
  if (this.getMap()) {
    this.setMap(null);
  } else {
    this.setMap(this.map_);
  }
}