var formler = []
$(function(){
        addSpellsToSpellbook();



        setInterval(function(){
            $.ajax({
            type: "GET",
            url: "http://galtvortskolen.net/",
            timeout: 10000,

            success:  function(newRowCount){
                // put the current data in a invisible div.
                $('#fullscrape').html(newRowCount);

                // target the chat.
                var chat = $('#fullscrape #indiv');

                // add chat to our chat box
                $('#chat_room').html(chat);

                // add correct link to each link of the chat room. (usually the name links).
                $("#chat_room a").each(function() {
                    var $this = $(this);
                    var _href = $this.attr("href");
                    $this.attr("href", "http://galtvortskolen.net" + _href );
                    $this.attr("target", "_blank");
                });

                var html_start = '<div class="chat-post"></div>';
                var html_end = '</div>';

                $('<div class="chat-post"></div>').wrap($('#chat_room a'));

                $('<br />').insertBefore("#chat_room a:not(:first-child)");
                //$(html_end).insertAfter($("#chat_room a").next().next());

                // check for new uglepost :^)
                if ($('#fullscrape .front-top-menu:last-child').text() != 'Uglepost(0)') {
                    $('#uglepost a').text('📬 ' + $('#fullscrape .front-top-menu:last-child').text());
                    var $this = $(this);
                    $this.attr("target", "_blank");
                }else {
                    $('#uglepost a').text('📭 ' + $('#fullscrape .front-top-menu:last-child').text());
                    $(this).attr("target", "_blank");
                }

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
    /* the format.
    <div class="formel">
            <strong></strong>
            <span></span>
            <br>
        </div>
     */

    $.getJSON( "spells.json", function( json ) {
        var id = 0;
        formler = [];
        $('.formel').remove();
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