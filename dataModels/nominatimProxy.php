<?php
	$lat = $_GET['lat'];
	$lng = $_GET['lng'];

//http://maps.googleapis.com/maps/api/geocode/json?latlng=40.239528,-3.690444&sensor=false

	$url = ' http://nominatim.openstreetmap.org/reverse?format=xml&lat='.$lat.'&lon='.$lng.'&zoom=6&addressdetails=0';
	$c = curl_init($url);
	curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
	$page = curl_exec($c);
	curl_close($c);
	echo $page;
?>