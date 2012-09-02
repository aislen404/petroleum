<?php
    $tipo = $_GET['tipo'];
	$latNS = $_GET['latNS'];
	$lngNS = $_GET['lngNS'];
	$latSW = $_GET['latSW'];
	$lngSW = $_GET['lngSW'];
	
	$url = 'http://geoportal.mityc.es/hidrocarburos/eess/queryPopUp.do?urlValor=http://geoportal.mityc.es/cgi-bin/mapserv?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=estaciones_servicio_brief&BBOX='.$lngSW.','.$latSW.','.$lngNS.','.$latNS.'&tipoCarburante='.$tipo.'&tipoBusqueda=0';

	$c = curl_init($url);
	curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
	$page = curl_exec($c);
	curl_close($c);
	echo $page;
?>