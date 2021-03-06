var formler = [];
var username = "";
var get_online_count = 0;
var house = 0;
$(function () {
    var first_run = false;
    if (!localStorage['ran_before']) {
        first_run = true;
        localStorage['ran_before'] = '1';
    }

    if (first_run) {
        $('#info_message').stop().show(function () {
            $('#info_message').animate({ marginLeft: "0%"} , 500);
            setTimeout(info_hide_click, 2000)
        })
        setTimeout(info_hide_click, 2000)
    }

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
        contentType: 'Content-type: text/plain; charset=iso-8859-1',
        beforeSend: function(jqXHR) {
            jqXHR.overrideMimeType('text/html;charset=iso-8859-1');
        },

        success: function (newRowCount) {
            try {
                var chat = [];
                $('#chat_room').html($(newRowCount).find(chat_type.chat_id));

                // get house id...
                house = $(newRowCount).find('div#header-userpanel a').map(function() {
                    return $(this).attr('href');
                }).get()[3].trim().replace(/[^0-9]/g, '');

                username = $(newRowCount).find('div#header-userpanel [href^="/?side=profiles&id="]').text();
                $('span#username').text(username);

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
                    if ($(this).find('span').text() == "Chrystean Dunston Applefield") {
                        var name = $(this).find('span').text()
                        $(this).find('span').text("🌟 "+name)
                    }
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
            contentType: 'Content-type: text/plain; charset=iso-8859-1',
            beforeSend: function(jqXHR) {
                jqXHR.overrideMimeType('text/html;charset=iso-8859-1');
            },
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
        contentType: 'Content-type: text/plain; charset=iso-8859-1',
        beforeSend: function(jqXHR) {
            jqXHR.overrideMimeType('text/html;charset=iso-8859-1');
        },
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
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://galtvortskolen.net');
    xhr.onload = function() {
        if (xhr.status === 200) {
            alert(xhr.responseText);
        }
        else {
            alert('Request failed.  Returned status of ' + xhr.status);
        }
    };
    xhr.send();
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
    var newURL = 'http://galtvortskolen.net/?side=online';
    chrome.tabs.create({url: newURL});
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
                '<div style="width:100%; text-align: center; padding-top:5px; padding-bottom:5px; background-color:darkred;' +
                'margin-bottom:5px; border-radius: 5px;">' +
                    '<strong>' + value.spell + '</strong>' +
                '</div>' +
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
        $('#control_strip').css('bottom', '30px', 'important');
        $(this).text('📓 Åpne formelbok');
        chrome.storage.sync.set({book_open:false});
    } else {
        // show
        $('#chat_room').css('width', '70%');
        $('#chat_input_field').css('width', '70%');
        $('#control_strip').css('bottom', '50px', 'important');
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
                    '<div style="width:100%; text-align: center; padding-top:5px; padding-bottom:5px; background-color:darkred;' +
                    'margin-bottom:5px; border-radius: 5px;">' +
                    '<strong>' + value.spell + '</strong>' +
                    '</div>' +
                    '<span>' + value.desc + '</span>' +
                    '</div>' +
                    '');
                id++;
            }
        })
    });

})


function debug_msg() {
    $.ajax({
        type: "GET",
        url: "http://galtvortskolen.net/?side=show_pm",
        timeout: 10000,

        success: function (data) {
            var messages = [];
            $(data).find('table [href^="/?side=read_pm"]').each(function () {
                console.log(this);
            })
        }
    });
}
function get_current_tab() {
    var tablink;
    chrome.tabs.getSelected(null,function(tab) {
        tablink = tab.url;
        console.log(tab.url);
    });
}

function get_every_message() {

    $('#inbox').show();
    $('#content_inbox table').empty();
    function getNumbers(inputString){
        var regex=/\d+\.\d+|\.\d+|\d+/g,
            results = [],
            n;

        while(n = regex.exec(inputString)) {
            results.push(parseFloat(n[0]));
        }

        return results;
    }



    $.ajax({
        type: "GET",
        url: "http://galtvortskolen.net/?side=show_pm",
        timeout: 10000,
        contentType: 'Content-type: text/plain; charset=iso-8859-1',
        beforeSend: function(jqXHR) {
            jqXHR.overrideMimeType('text/html;charset=iso-8859-1');
        },
        success: function (data) {
            $(data).find('table tr').each(function () {

                // remove premium features, as it is not a feature on this extension.
                var user_premium = ($(this).find('td').length == 5)
                if (user_premium) {
                    $(this).find('td').first().remove();
                }

                // set the correct path for unread/read img
                $(this).find('img').attr('src', 'http://galtvortskolen.net/' + $(this).find('img').attr('src'))


                if ($(this).find('a:nth-child(1)').text().length > 1) {
                    var link = $(this).find('a:nth-child(1)');


                    $(link).attr('data-msg_id', getNumbers(link.attr('href')));
                    $(link).addClass('inbox_item')


                }



                // append the data into the screen.
                $('#content_inbox table').append('' +
                    '<tr>' + $(this).html() + '</tr>')
            });

            $('a.inbox_item').on('click', function (e) {
                e.preventDefault();
                var emne = $(this).text();
                open_msg($(this).data('msg_id'), emne);

            })

            function open_msg(id, emne) {
                    $.ajax({
                        type: "GET",
                        url: "http://galtvortskolen.net/?side=read_pm&id="+id,
                        timeout: 10000,
                        contentType: 'Content-type: text/plain; charset=iso-8859-1',
                        beforeSend: function(jqXHR) {
                            jqXHR.overrideMimeType('text/html;charset=iso-8859-1');
                        },
                        success: function (data) {

                            $('#content_message #msg_body').html($(data).find('#middle-main p').html())
                            $('#content_message l').text($(data).find('#middle-main a').first().text())
                            $('#inbox').hide();
                            $('#message').show();
                            $('#message button').attr('data-emne', emne);
                            $('#message button').attr('data-id', id)
                            $('#message button').attr('data-username', $(data).find('#middle-main a').first().text());
                        }
                    });
                }



        }
    });

    $('#send_pm').click(function () {
        function send_pm(to, subject, msg) {
            var data = chat_type.input_name + "=" + msg.trim() + "&" + chat_type.button_name + "=" + $('input[name="' + chat_type.button_name + '"]').val();
            var data = "pm_submit=Send&subject="+subject+"&text="+msg+"&to="+to
            $.post({
                url: 'http://galtvortskolen.net/?side=send_pm',
                data: data,
            });
            return true;
        }



        var msg = $('#answer_pm').val();
        msg = escape(msg).replace(/\+/g, "%2B");
        var subject = $(this).data('emne');
        var username = $(this).data('username').replace(/ \(.*\)/g, '');
        send_pm(username, subject, msg)
        $('#answer_pm').val("");
        $('#message').hide();
        get_every_message();



    })
}




$('#info_icon').hover(function() {
    $(this).stop().animate({ bottom: '-1' }, 'fast');
}, function() {
    $(this).stop().animate({ bottom: '-5'}, 'fast');
});

function info_hide_click() {
    $('body').click(function () {

        if ($('#info_message').is(':visible')) {
            $('#info_message').animate({ marginLeft: "100%"} , 500);
        }


    })
}

$('#info_icon').click(function () {
    $('body').unbind("click");
    $('#info_message').stop().show(function () {
        $('#info_message').animate({ marginLeft: "0%"} , 500);
        setTimeout(info_hide_click, 2000)
    })
})

$('button#contact_owner').click(function () {
    var newURL = 'http://galtvortskolen.net/?side=profiles&id=59751';
    chrome.tabs.create({url: newURL});
});

$('button#news').click(function () {
    var newURL = 'http://www.galtvortskolen.net/?side=comments&id=881';
    chrome.tabs.create({url: newURL});
});

$('#go_back_to_inbox').click(function () {
    $('#message').hide();
    get_every_message();
})

$('#go_back_to_chat').click(function () {
    $('#inbox').hide();
    unbind_inbox_stuff();
})

$('#a_uglepost').click(function (e) {
    e.preventDefault();
    unbind_inbox_stuff()
    if ($('#inbox').is(':visible')) {
        $('#message').hide();
        $('#inbox').hide();
    }else {

        get_every_message();
    }
})


function unbind_inbox_stuff() {
    $('#send_pm').unbind();
    $('a.inbox_item').unbind();

}
