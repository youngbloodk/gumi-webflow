$(document).ready(function() {
    if(!$.cookie('gumi_popup')) {
        $('#popup-overlay').fadeIn();
    }

    $('[popup="close"]').click(function() {
        $('#popup-overlay').fadeOut();
        $.cookie('gumi_popup', moment().valueOf());
        if($(this).attr("href")) location.href = "/box?state=build";
    });

    $('#email_signup').submit(function(e) {
        const $email = $('#custEmail').val();

        e.preventDefault();

        if(!$email) {
            alert('Please fill out all fields before submitting :)');
        } else {
            sendToKlaviyo($email).then(res => {
                console.log(res);
            });
        }
    });

    async function sendToKlaviyo(email) {
        const settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://manage.kmail-lists.com/ajax/subscriptions/subscribe",
            "method": "POST",
            "headers": {
                "content-type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache"
            },
            "data": {
                "g": "TdSCNw",
                "$fields": "$source",
                "email": email,
                "$source": "Gumi Site"
            }
        };

        $.ajax(settings).done(res => {
            gtag('event', 'email_singup', {
                'email_list_id': 'TdSCNw'
            });
        });
    }

    //countdown timer
    let now = moment().valueOf();
    let today = moment().format('YYYY-MM-DD');
    let midnight = moment(moment(today).add(1, 'day')).valueOf();
    let duration = moment.duration(midnight - now);
    let interval = 1000;

    setInterval(function() {
        duration = moment.duration(duration - interval, 'milliseconds');
        $('#countdown').text(twoDigit(duration.hours()) + ":" + twoDigit(duration.minutes()) + ":" + twoDigit(duration.seconds()));
    }, interval);

    function twoDigit(n) {
        return (n < 10 ? "0" : "") + n;
    }
});