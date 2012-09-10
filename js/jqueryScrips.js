function renderToggle_view (el) {
    el = '#'+el;

    var val = $(el).attr("class");

    if(val == "mapa") {
        val = "lista";
    } else {
        val = "mapa";
    }
    $(el).attr('class',val);

    $('#list').toggle();
    $('#map').toggle();

}