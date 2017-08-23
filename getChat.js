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
        },1000); // 5000ms == 5 seconds
});

$('#chat_input_field').bind('keyup', function(e) {

    if ( e.keyCode === 13 ) { // 13 is enter key
        postMsg($('#chat_input_field textarea').val());
        $('#chat_input_field textarea').val('');

    }

});

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
function insertAtCaret(areaId, text) {
    var txtarea = document.getElementById(areaId);
    if (!txtarea) { return; }

    var scrollPos = txtarea.scrollTop;
    var strPos = 0;
    var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
        "ff" : (document.selection ? "ie" : false ) );
    if (br == "ie") {
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart ('character', -txtarea.value.length);
        strPos = range.text.length;
    } else if (br == "ff") {
        strPos = txtarea.selectionStart;
    }

    var front = (txtarea.value).substring(0, strPos);
    var back = (txtarea.value).substring(strPos, txtarea.value.length);
    txtarea.value = front + text + back;
    strPos = strPos + text.length;
    if (br == "ie") {
        txtarea.focus();
        var ieRange = document.selection.createRange();
        ieRange.moveStart ('character', -txtarea.value.length);
        ieRange.moveStart ('character', strPos);
        ieRange.moveEnd ('character', 0);
        ieRange.select();
    } else if (br == "ff") {
        txtarea.selectionStart = strPos;
        txtarea.selectionEnd = strPos;
        txtarea.focus();
    }

    txtarea.scrollTop = scrollPos;
}

$('#quote_start').click(function () {
    $('textarea#textareaid').append('«');
});

$('#quote_end').click(function () {
    $('textarea#textareaid').append('»');
});