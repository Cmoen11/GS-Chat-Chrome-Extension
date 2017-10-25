
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
                chrome.browserAction.setBadgeText({text:"Avlogget"});
                chrome.storage.sync.set({'unread_uglepost_count' : '-1'})
            }
            else if (unread_uglepost_count == 0) {
                chrome.browserAction.setBadgeText({text:''});
                chrome.storage.sync.set({'unread_uglepost_count' : unread_uglepost_count})
            }
            else {
                chrome.browserAction.setBadgeText({text:unread_uglepost_count});
                chrome.storage.sync.set({'unread_uglepost_count' : unread_uglepost_count})
            }

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log("error handled");
        }

    });
}, 5000); // sjekker om nye ugler hvert 5'ene sek.




chrome.storage.onChanged.addListener(function(changes, namespace) {
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
                            iconUrl : 'img/icon.png'
                        }, function () {
                            console.log('notification sent.');
                        })
                    }
                });
            }

        }


    }
});


