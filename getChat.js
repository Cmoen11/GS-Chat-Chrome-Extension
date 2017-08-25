var formler = []
$(function(){
        addSpellsToSpellbook();
        setInterval(function(){
            $.ajax({
                type: "GET",
                url: "http://galtvortskolen.net/",
                timeout: 10000,

                success:  function(newRowCount){
                    $('#fullscrape').html(newRowCount);
                    var chat = $('#fullscrape #indiv');
                    $('#fullscrape #indiv br').append('<br/>')
                    $('#chat_room').html(chat);
                    $("#chat_room a").each(function() {
                        var $this = $(this);
                        var _href = $this.attr("href");
                        $this.attr("href", "http://galtvortskolen.net" + _href );
                        $this.attr("target", "_blank");
                    });
                    $('#fullscrape').html('cleard');
                },
            });
        },1000); // 5000ms == 5 seconds
});

$('#chat_input_field').bind('keyup', function(e) {

    if ( e.keyCode === 13 ) { // 13 is enter key
        postMsg($('#chat_input_field textarea').val());
        $('#chat_input_field textarea').val('');

    }

});

function addSpellsToSpellbook(){
    /*
    <div class="formel">
            <strong></strong>
            <span></span>
            <br>
        </div>
     */

    $.getJSON( "spells.json", function( json ) {
        var id = 0;
        formler = [];
        $.each(json, function (key, value) {
            formler.push(value);
            $('#book').append('' +
                '<div data-id='+id+' class="formel">' +
                '<strong>' + value.spell + ' </strong>' +
                '<span>' + value.desc + '</span>' +
                '</div>' +
                '');
            id++;
        })
    });
}


function postMsg(msg) {
    msg = msg.replace(/\n|\r/g, "");
    msg = escape(msg).replace(/\+/g, "%2B");
    var data = "chat_message="+msg.trim()+ "&chat_submit=Send";
    console.log(msg);
    $.ajax({
        type:"POST",
        url: "http://galtvortskolen.net/",
        processData: false,
        data: data,
        success: function (data) {
            console.log(data);
        },
        dataType: "html",
        contentType: "application/x-www-form-urlencoded"
    })
}


$('#quote_start').click(function () {
    $('#textareaid').val($('#textareaid').val() +'«');
});

$('#quote_end').click(function () {
    $('#textareaid').val($('#textareaid').val() +'»');
});
$('#quote_both').click(function () {
    $('#textareaid').val($('#textareaid').val() +'«»');
});
$('#spell_book').click(function () {
    addSpellsToSpellbook();
});

$('#book').on('click', '.formel', function () {
    var id = $(this).data('id');
    formel_navn = formler[id].spell;
    $('#textareaid').val($('#textareaid').val() + formel_navn);
});