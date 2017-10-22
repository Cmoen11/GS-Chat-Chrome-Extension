var formler = []

$(function(){
        addSpellsToSpellbook();


        setInterval(function(){
            chat_type = getChat($('#chat_channel').val());
            $.ajax({
            type: "GET",
            url: "http://galtvortskolen.net/?side="+chat_type.url,
            timeout: 10000,

            success:  function(newRowCount){
                try {
                    var chat = [];
                    $('#chat_room').html($(newRowCount).find(chat_type.chat_id));
                    $("#chat_room a").each(function() {

                        // for each link in chat, add correct path.
                        var $this = $(this);
                        var _href = $this.attr("href");
                        $this.attr("href", "http://galtvortskolen.net" + _href );
                        $this.attr("target", "_blank");
                        $("#chat_room a").css("margin-right", "5px");


                    });
                    $('#chat_room p').each(function () {
                        if($.inArray(this, chat) == -1) {
                            chat.push(this);
                        }
                    })
                    if (chat_type.reverse) {
                        chat.reverse();
                    }

                    $('#chat_room').html('');
                    for (var i = 0; i < chat.length; i++) {
                        $('#chat_room').append(chat[i]);
                    }

                    // set uglepost..
                    var uglepost = $(newRowCount).find('.front-top-menu:last-child').text();
                    if (uglepost != 'Uglepost(0)') {
                        $('#uglepost a').text('📬 ' + uglepost);
                        $('#uglepost a').css("color", "#3098FF");
                    }else {
                        $('#uglepost a').text('📭 ' + uglepost);
                        $('#uglepost a').css("color", "white");
                    }
                }catch (err) {
                    console.log(err);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                console.log("error handled");
            }
                
        });
        },1000); // 5000ms == 5 seconds


});

$('#chat_input_field').bind('keyup', function(e) {

    if ( e.keyCode === 13 ) { // 13 is enter key
        postMsg($('#chat_input_field textarea').val());
        $('#chat_input_field textarea').val('');
        $('#textareaid').focus(); // keep the focus

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
    chat_type = getChat($('#chat_channel').val());
    msg = msg.replace(/\n|\r/g, "");
    msg = escape(msg).replace(/\+/g, "%2B");
    console.log('input[name="'+chat_type.button_name+'"]');
    var data = chat_type.input_name+"="+msg.trim()+ "&"+chat_type.button_name+"="+$('input[name="'+chat_type.button_name+'"]').val();
    console.log(msg);
    $.ajax({
        type:"POST",
        url: "http://galtvortskolen.net/?side="+chat_type.url,
        processData: false,
        data: data,
        success: function (data) {
            console.log(data);
        },
        dataType: "html",
        contentType: "application/x-www-form-urlencoded"
    })
    console.log(data);
}

// hide or show book.
$('#toggle_book').click(function () {
    if($('#book').is(':visible')) {
        // hide
        $('#book').hide();
        $('#chat_room').css('width', '96%');
        $('#chat_input_field').css('width', '97%');
        $('#control_strip').css('bottom', '56px');
        $(this).text('📓 Åpne formelbok');
    } else {
      // show
        $('#chat_room').css('width', '70%');
        $('#chat_input_field').css('width', '70%');
        $('#control_strip').css('bottom', '75px');
        $(this).text('📓 Lukk formelbok');
        $('#book').show();
    }
});


$('#quote_start').click(function () {
    $('#textareaid').val($('#textareaid').val() +'«');
    $('#textareaid').focus();
});

$('#quote_end').click(function () {
    $('#textareaid').val($('#textareaid').val() +'»');
    $('#textareaid').focus();
});
$('#quote_both').click(function () {
    $('#textareaid').val($('#textareaid').val() +'«»');
    $('#textareaid').focus();
});


$('#spell_book').click(function () {
    addSpellsToSpellbook();
    $('#textareaid').focus();
});

$('#toggle_book').click();

$('#book').on('click', '.formel', function () {
    var id = $(this).data('id');
    formel_navn = formler[id].spell;
    $('#textareaid').val($('#textareaid').val() + formel_navn);
});


function getChat(chat_type) {
    // chat type is what chat to return
    switch (chat_type) {
        case 'RPG':
            return {'url' : 'rpg_chat', chat_id: '#chat-room-form', input_name : 'message_rpg', button_name : 'rpg_chat_submit', reverse : true}
            break;
        case 'RL':
            return {'url' : 'rl_chat', chat_id : '#chat-room-form', input_name : 'message_rl', button_name : 'rl_chat_submit', reverse : false}
            break;
        default :
            // gives back default Storsalen chat
            return {'url' : 'chat', chat_id : '#chat_big', input_name: 'chat_message', button_name : 'chat_submit', reverse : false}
    }
}


$('#chat_channel').change(function() {
    $('span#chat-room-text').text($(this).val());
    $('#textareaid').focus();
});
/*
var textarea = $('#textareaid');

textarea.bind("blur", function() {
    setTimeout(function() {
        textarea.focus();
    }, 0);
});*/