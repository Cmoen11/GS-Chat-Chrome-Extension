$(function(){
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

                    $('#fullscrape').html('cleard');
                },
            });
        },100000); // 5000ms == 5 seconds
});

$('#chat_input_field').bind('keyup', function(e) {

    if ( e.keyCode === 13 ) { // 13 is enter key
        postMsg($('#chat_input_field textarea').val());
        $('#chat_input_field textarea').val('');

    }

});

function postMsg(msg) {
    var data = {chat_message:msg.trim(), "chat_submit": "Send"}
    console.log(msg);
    $.ajax({
        type:"POST",
        url: "http://galtvortskolen.net/",
        data: data,
        contentType: 'Content-type: text/plain; charset=iso-8859-1',
        beforeSend: function(jqXHR) {
            jqXHR.overrideMimeType('text/html;charset=iso-8859-1');
        },
        success: success
    })
}
