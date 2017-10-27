setInterval(function () {


    $.ajax({
        type: "GET",
        url: "http://galtvortskolen.net/",
        timeout: 10000,

        success: function (data) {


            // checking unread_uglepost_count
            var unread_uglepost_count = $(data).find('.front-top-menu:last-child').text().trim().replace(/[^0-9]/g, '');

            // changing badge to corresponding unread_uglepost_count
            if (unread_uglepost_count == '') {
                swap_cookies();
                chrome.browserAction.setBadgeText({text: "Avlogget"});
                chrome.storage.sync.set({'unread_uglepost_count': '-1'})
            }
            else if (unread_uglepost_count == 0) {
                chrome.browserAction.setBadgeText({text: ''});
                chrome.storage.sync.set({'unread_uglepost_count': unread_uglepost_count})
            }
            else {
                chrome.browserAction.setBadgeText({text: unread_uglepost_count});
                chrome.storage.sync.set({'unread_uglepost_count': unread_uglepost_count})
            }

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log("error handled");
        }

    });
}, 5000); // sjekker om nye ugler hvert 5'ene sek.

function getCookies(domain, name, callback) {
    chrome.cookies.get({"url": domain, "name": name}, function (cookie) {
        if (callback) {
            callback(cookie.value);
        }
    });
}

/*
Used to see what sub-domain user may be logged into.. And then set the valid cookie for http:// instead of http://www.
 */


function swap_cookies() {
    // first, check if we can get uglepost from http://galtvortskolen.net ( if so, we do not need to do anything ).
    // test the other sub-domain
    var domain_prev = 'http://galtvortskolen.net';


    // okay. it seems like user is logged into www. instead of just http://, now we grab the cookie from www.
    // and set it as http:// so we can pull data from it.
    console.log("swapping cookies");
    var domain = 'http://www.galtvortskolen.net';
    var key = 'PHPSESSID'
    getCookies(domain_prev, key, function (id) {
        chrome.cookies.set({url: domain, name: key, value:id}, function () {
        })
    })

    return getUglepostFromSub(domain, function (err, response) {
        var unread_uglepost_count = $(response).find('.front-top-menu:last-child').text().trim().replace(/[^0-9]/g, '');
        if (unread_uglepost_count != '') return false;    // everything is how it should

        return true
    });

}


function getUglepostFromSub(url, callback){
    $.ajax({
        type: "GET",
        url: "http://galtvortskolen.net/",
        timeout: 10000,
        success: function (stuff) {
            return callback(null, stuff);
        }
    })
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (key in changes) {
        var storageChange = changes[key];

        // if uglepost has incremented since last check.. give a notification to the user
        if (key == 'unread_uglepost_count') {
            // first check if
            if (storageChange.newValue > storageChange.oldValue && storageChange.newValue > 0) {
                $.ajax({
                    type: "GET",
                    url: "http://galtvortskolen.net/?side=show_pm",
                    timeout: 10000,

                    success: function (data) {
                        chrome.notifications.create({
                            type: 'basic',
                            title: 'Ny ugle',
                            message: 'Ny ugle fra ' + $(data).find('table a span').first().text().replace(/ \(.*\)/, ""),
                            iconUrl: 'img/icon.png'
                        }, function () {
                            console.log('notification sent.');
                        })
                    }
                });
            }

        }


    }
});


chrome.notifications.onClicked.addListener(function () {
    var newURL = 'http://galtvortskolen.net/?side=show_pm';
    chrome.tabs.create({url: newURL});
});
