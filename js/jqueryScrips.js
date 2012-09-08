function initJqueryScripts (){
    $('#myModal').hide();
    $('#list').hide();
}

function slidingForm () {

    var current = 1;
    var stepsWidth = 0;
    var widths = [];

    $('#steps .step').each(function(i){
        var $step 		= $(this);
        widths[i]  		= stepsWidth;
        stepsWidth	 	+= $step.width();
    });

    $('#steps').width(stepsWidth);

    $('#navigation').show();

    $('#navigation a').bind('click',function(e){
        var $this	= $(this);
        $this.closest('ul').find('li').removeClass('selected');
        $this.parent().addClass('selected');

        current = $this.parent().index() + 1;

        $('#steps').stop().animate({
            marginLeft: '-' + widths[current-1] + 'px'
        },1500,function(){
            $('#formElem').children(':nth-child('+ parseInt(current) +')').find(':input:first').focus();
        });
        e.preventDefault();
    });

    $('#readyGo').bind('click',function(){
        if(true){
            alert('Please correct the errors in the Form');
            return false;
        }
    });
}

function showOption (x){
    $('#myModal').modal('toggle');
    $(x).click();
}

function showRender (el){
    if(el.className == "mapa") {
        el.className="lista";
    } else {
        el.className="mapa";
    }
    $('#list').toggle();
    $('#map').toggle();
}