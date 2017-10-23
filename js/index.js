var formler = []
var username = ""


$(function () {
    addSpellsToSpellbook();
    check_if_logged_in();

    setInterval(function () {
        chat_type = getChat($('#chat_channel').val());
        $.ajax({
            type: "GET",
            url: "http://galtvortskolen.net/?side=" + chat_type.url,
            timeout: 10000,

            success: function (newRowCount) {
                try {
                    var chat = [];
                    $('#chat_room').html($(newRowCount).find(chat_type.chat_id));

                    // a href="/\?side=profiles.*id=.*">.*<br>



                    $("#chat_room a").each(function () {

                        // for each link in chat, add correct path.
                        var $this = $(this);
                        var _href = $this.attr("href");
                        $this.attr("href", "http://galtvortskolen.net" + _href);
                        $this.attr("target", "_blank");
                        $("#chat_room a").css("margin-right", "5px");


                    });
                    /* ADD CHAT TO ARRAY AND DISPLAY IT BACK ON CANVAS. */
                    // THIS CODE NEEDS TO BE REFACTORED.
                    $('#chat_room p').each(function () {
                        if ($.inArray(this, chat) == -1) {
                            chat.push(this);
                        }
                    })

                    // is the chat is in reverse as the RPG chat is. Reverse it to follow patterns.
                    if (chat_type.reverse) {
                        chat.reverse();
                    }

                    $('#chat_room').html('');
                    for (var i = 0; i < chat.length; i++) {
                        $('#chat_room').append(chat[i]);
                    }

                    // set uglepost..
                    var uglepost = $(newRowCount).find('.front-top-menu:last-child').text().trim();
                    if (uglepost != 'Uglepost(0)') {
                        $('#uglepost a').text('📬 ' + uglepost);
                        $('#uglepost a').css("color", "#3098FF");
                    } else {
                        $('#uglepost a').text('📭 ' + uglepost);
                        $('#uglepost a').css("color", "white");
                    }

                    // to ensure the user is logged in.. If It can't receive Uglepost, it indicates that the user is not logged in.
                    if (uglepost == '' || uglepost.length == 0) {
                        //login()
                    }

                } catch (err) {
                    console.log(err);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log("error handled");
            }

        });
    }, 1000); // 5000ms == 5 seconds


});



/*
    For sending the message.. :-)
 */
$('#chat_input_field').bind('keyup', function (e) {

    function postMsg(msg) {
        chat_type = getChat($('#chat_channel').val());
        msg = msg.replace(/\n|\r/g, "");
        msg = escape(msg).replace(/\+/g, "%2B");
        console.log('input[name="' + chat_type.button_name + '"]');
        var data = chat_type.input_name + "=" + msg.trim() + "&" + chat_type.button_name + "=" + $('input[name="' + chat_type.button_name + '"]').val();
        console.log(msg);
        $.ajax({
            type: "POST",
            url: "http://galtvortskolen.net/?side=" + chat_type.url,
            processData: false,
            data: data,
            success: function (data) {
            },
            dataType: "html",
            contentType: "application/x-www-form-urlencoded"
        })
    }

    // enter key is pressed. -> send away our message
    if (e.keyCode === 13) { // 13 is enter key
        postMsg($('#chat_input_field textarea').val());
        $('#chat_input_field textarea').val('');
        $('#textareaid').focus(); // keep the focus

    }

});
function check_if_logged_in() {
    return;
}
function login() {
    var newURL = 'http://galtvortskolen.net'
    chrome.tabs.create({url: newURL});
    chrome.notifications.create('Du må logge inn',{title:'Du må logge inn', message: 'Logg inn for å fortsette'})
}

function addSpellsToSpellbook() {
    $.getJSON("spells.json", function (json) {
        var id = 0;
        formler = [];
        $('.formel').remove();
        $.each(json, function (key, value) {
            formler.push(value);
            $('#book').append('' +
                '<div data-id=' + id + ' class="formel">' +
                '<strong>' + value.spell + ' </strong>' +
                '<span>' + value.desc + '</span>' +
                '</div>' +
                '');
            id++;
        })
    });
}







function getChat(chat_type) {
    // chat type is what chat to return
    switch (chat_type) {
        case 'RPG':
            return {
                'url': 'rpg_chat',
                chat_id: '#chatboxrpg',
                input_name: 'rpg_chat_message',
                button_name: 'rpg_chat',
                reverse: true,
                chat_type : 1
            }
            break;
        case 'RL':
            return {
                'url': 'rl_chat',
                chat_id: '#chat-room-form',
                input_name: 'message_rl',
                button_name: 'rl_chat_submit',
                reverse: false,
                chat_type : 1
            }
            break;
        case 'Skoleparken':
            return {
                'url': 'chat',
                chat_id: '#chat-room-form',
                input_name: 'park_message',
                button_name: 'park_submit',
                reverse: false,
                chat_type : 2
            }
            break;
        default :
            // gives back default Storsalen chat
            return {
                'url': 'chat',
                chat_id: '#chat_big',
                input_name: 'chat_message',
                button_name: 'chat_submit',
                reverse: false,
                chat_type : 1
            }
    }
}


$('#chat_channel').change(function () {
    $('span#chat-room-text').text($(this).val());
    $('#textareaid').focus();
});


$('#quote_start').click(function () {
    $('#textareaid').val($('#textareaid').val() + '«');
    $('#textareaid').focus();
});

$('#quote_end').click(function () {
    $('#textareaid').val($('#textareaid').val() + '»');
    $('#textareaid').focus();
});
$('#quote_both').click(function () {
    $('#textareaid').val($('#textareaid').val() + '«»');
    $('#textareaid').focus();
});
$('#book').on('click', '.formel', function () {
    var id = $(this).data('id');
    formel_navn = formler[id].spell;
    $('#textareaid').val($('#textareaid').val() + formel_navn);
});

$('#spell_book').click(function () {
    addSpellsToSpellbook();
    $('#textareaid').focus();
});
// hide or show book.
$('#toggle_book').click(function () {
    if ($('#book').is(':visible')) {
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

$('#toggle_book').click();


