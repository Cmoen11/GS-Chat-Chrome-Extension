var formler = [];
var username = "";
var get_online_count = 0;
var house = 0;
$(function () {
    addSpellsToSpellbook();
    fetchData();
    setInterval(function () {
        fetchData();
    }, 5000); // 5000ms == 5 seconds


});

function fetchData() {
    chat_type = getChat($('#chat_channel').val());
    $.ajax({
        type: "GET",
        url: "http://galtvortskolen.net/?side=" + chat_type.url,
        timeout: 10000,

        success: function (newRowCount) {
            try {
                var chat = [];
                $('#chat_room').html($(newRowCount).find(chat_type.chat_id));

                // get house id...
                house = $(newRowCount).find('div#header-userpanel a').map(function() {
                    return $(this).attr('href');
                }).get()[3].trim().replace(/[^0-9]/g, '');


                // get online count and update gui.
                var get_online_count = $(newRowCount).find('[href="/?side=online"]').text().trim().replace(/[^0-9]/g, '');
                $("span#antSpill").text(get_online_count);

                // for each link in chat, add correct path & correct some styles.
                $("#chat_room a").each(function () {
                    var $this = $(this);
                    var _href = $this.attr("href");
                    $this.attr("href", "http://galtvortskolen.net" + _href);
                    $this.attr("target", "_blank");
                    $("#chat_room a").css("margin-right", "5px");


                });
                /* ADD CHAT TO ARRAY AND DISPLAY IT BACK ON CANVAS. */
                // THIS CODE NEEDS TO BE REFACTORED.

                $('#chat_room p').each(function () {
                    chat.push(this);
                });


                // is the chat is in reverse as the RPG chat is. Reverse it to follow patterns.
                if (chat_type.reverse) {
                    chat.reverse();

                }

                $('#chat_room').html('');
                for (var i = 0; i < chat.length; i++) {
                    $('#chat_room').append(chat[i]);
                }


                // set uglepost..
                update_uglepost(newRowCount);

                change_chat_font_size();

            } catch (err) {
                console.log(err);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log("error handled");
        }

    });
}



function update_uglepost(newRowCount) {
    var uglepost = $(newRowCount).find('.front-top-menu:last-child').text().trim();
    if (uglepost != 'Uglepost(0)') {
        $('#uglepost a').text('📬 ' + uglepost);
        $('a#a_uglepost').css("color", "#3098FF");
    } else {
        $('#uglepost a').text('📭 ' + uglepost);
        $('#uglepost a').css("color", "white");
    }

}


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
        fetchData(); // update gui
    }

});


function getChatType2() {
    chat = getChat('Skoleparken')
    regex  = '<a.*<br>'

    $.ajax({
        type: "GET",
        url: "http://galtvortskolen.net/?side="+chat.url,
        timeout: 10000,
        dataType: "html",
        contentType: "application/x-www-form-urlencoded",
        success: function (data) {
            // if past bedtime warning is present.. accept it.. and try to fetch again.
            if ($(data).find('input[name="_park_warn"]').val() == 'Jeg er advart.') {
                var data = {'_park_warn' : 'Jeg er advart.'}
                $.post('http://galtvortskolen.net/?side=park', data);
                getChatType2();
                return;
            } else { // otherwise.. grab that data :^)
                $('#chat_room').html($(data).find(chat.chat_id));
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log("error handled" + errorThrown);
        }

    });

}


$('button#debug_button').click(function () {
    getChatType2();
})
/*
url: "/chat_skolegaard.php",
			dataType: "jsonp"
 */


function getChat(chat_type) {
    // chat type is what chat to return
    switch (chat_type) {
        case 'RPG':
            return {
                url: 'rpg_chat',
                chat_id: '#chatboxrpg',
                input_name: 'rpg_chat_message',
                button_name: 'rpg_chat',
                reverse: true,
                chat_type : 1
            };
            break;
        case 'RL':
            return {
                url: 'rl_chat',
                chat_id: '#chat-room-form',
                input_name: 'message_rl',
                button_name: 'rl_chat_submit',
                reverse: false,
                chat_type : 1
            };
            break;
        case 'Skoleparken':
            return {
                url: 'park',
                chat_id: '.chat-room-form',
                input_name: 'message',
                button_name: 'opphold_chat_submit',
                reverse: false,
                chat_type : 2
            };
            break;
        case 'Oppholdsrom':
            return {
                url: 'oppholdsrom&id='+house,
                chat_id: '#chat-room-form',
                input_name: 'park_message',
                button_name: 'park_submit',
                reverse: false,
                chat_type : 2
            };
            break;
        default :
            // gives back default Storsalen chat
            return {
                url: 'chat',
                chat_id: '#chat_big',
                input_name: 'chat_message',
                button_name: 'chat_submit',
                reverse: false,
                chat_type : 1
            }
    }
}


/*
****
*       EVERYTHING THAT INCLUDES PRESSING BUTTONS 'N STUFF.
* ***
 */


$('#chat_channel').change(function () {
    $('span#chat-room-text').text($(this).val());
    chrome.storage.sync.set({chat_room:$(this).val()});
    fetchData();
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

$('span#players_online').click(function () {
    alert("yeah");
})


/*
****
*       METHODS FOR CHANGE STUFF UI.
* ***
 */

function change_chat_font_size() {
    chrome.storage.sync.get('font-size', function (items) {
        if (!chrome.runtime.error) {
            $('div#chat_room p').css('font-size', items.data);
        }
    })
}

// adding spells from spell json file..
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


// hide or show book.
$('#toggle_book').click(function () {
    if ($('#book').is(':visible')) {
        // hide
        $('#book').hide();
        $('#chat_room').css('width', '96%');
        $('#chat_input_field').css('width', '97%');
        $('#control_strip').css('bottom', '77px', 'important');
        $(this).text('📓 Åpne formelbok');
        chrome.storage.sync.set({book_open:false});
    } else {
        // show
        $('#chat_room').css('width', '70%');
        $('#chat_input_field').css('width', '70%');
        $('#control_strip').css('bottom', '96px', 'important');
        $(this).text('📓 Lukk formelbok');
        chrome.storage.sync.set({book_open:true});
        $('#book').show();
    }
});



/*
****
*       LOADING PREVIOUS INTERACTIONS DATA.
* ***
 */

// loading up chat-room.
chrome.storage.sync.get("chat_room", function (obj) {
    if (obj.chat_room != null) {
        $('#chat_channel').val(obj.chat_room);
        $('span#chat-room-text').text(obj.chat_room);
        fetchData();
    }
});

// open or close book?
chrome.storage.sync.get("book_open", function (obj) {
    if (obj.book_open != null)
        console.log(obj.book_open);
        if (obj.book_open != true) {
            $("#toggle_book").click();
        }
});


/*
****
*       LISTENER 'N STUFF.
* ***
 */
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
        var storageChange = changes[key];

        // change font-size on chat.
        if (key == 'font-size') {
            if (storageChange.newValue < 10 && storageChange.newValue > 20)
                $('div#chat_room p').css('font-size', storageChange.newValue);
        }
    }
});

$('input#font-size').change(function() {
    chrome.storage.sync.set({'font-size': $(this).val() + 'px'});
});

$('textarea#textareaid').change(function () {
   chrome.storage.local.set({msg:$(this).val()});
});
chrome.storage.local.get("msg", function (obj) {
    $('textarea#textareaid').val(obj.msg);
})

$('input#book_search').change(function () {
    $('div.formel').remove();
    $.getJSON("spells.json", function (json) {
        var id = 0;
        formler = [];   // empty previous formel list ( used to look it up in a different method.
        $('.formel').remove();  // remove all previous spells from the book.

        // for each spell, check if it fits criteria given by the user.
        $.each(json, function (key, value) {
            if (value.desc.toLowerCase().indexOf($('input#book_search').val().toLowerCase()) !== -1
                || value.spell.toLowerCase().indexOf($('input#book_search').val().toLowerCase()) !== -1
                || $('input#book_search').val() == '') {

                formler.push(value);
                $('#book').append('' +
                    '<div data-id=' + id + ' class="formel">' +
                    '<strong>' + value.spell + ' </strong>' +
                    '<span>' + value.desc + '</span>' +
                    '</div>' +
                    '');
                id++;
            }
        })
    });

})