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

function addRow (data) {

    var tds ='<tr>';
    tds += '<td>'+data.rotulo+'</td>';
    tds += '<td>'+data.precio+'</td>';
    tds += '<td>'+data.lat+'</td>';
    tds += '<td>'+data.lng+'</td>';
    tds+='</tr>';

    $('#tabla tbody').append(tds);
}
function clearTable (){
    $('#tabla tbody').html('');
}
