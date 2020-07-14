async function initMap() {
	var campgroundId = document.getElementById("init-map.js").getAttribute("data");
	
	var campgroundTest = JSON.parse(campground);
	console.log("campground name: ", campgroundTest.name)

	var lat = campground.lat;
	var lng = campground.lng;
	var center = {lat: lat, lng: lng };
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 8,
		center: center,
		scrollwheel: false
	});
	var contentString = `
		<strong><%= campgroundInstance.name %><br />
		<%= Address: campgroundInstance.location %></strong>
		<p>Description: <%= campgroundInstance.description %></p>
	`
	var infowindow = new google.maps.InfoWindow({
		content: contentString
	});
	var marker = new google.maps.Marker({
		position: center,
		map: map
	});
	marker.addListener('click', function() {
		infowindow.open(map, marker);
	});
}

async function getNearbyImages() {
	const url = "/maps/" + "lat/" + lat + "lng/" + lng;
	const request = new Request(url, {
		method: "GET",
		credentials: "same-origin",
		headers: {
			"Content-Type": "application/json"
		}
	});
}