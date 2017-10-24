
setInterval(function () {
    $.ajax({
        type: "GET",
        url: "http://galtvortskolen.net/",
        timeout: 10000,

        success: function (data) {

            // checking uglepost
            var uglepost = $(data).find('.front-top-menu:last-child').text().trim().replace(/[^0-9]/g, '');
            if (uglepost == '') chrome.browserAction.setBadgeText({text:"Avlogget"});
            else if (uglepost == 0) chrome.browserAction.setBadgeText({text:''});
            else chrome.browserAction.setBadgeText({text:uglepost});


        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log("error handled");
        }

    });
}, 1000); // sjekker om nye ugler hvert 10'ene sek.


