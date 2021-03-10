//global variables
const signedIn = !$.cookie('gumiAuth') == false;
// const currentUser =;

// global functions
function renderBoxCount() {
    const boxData = JSON.parse(localStorage.getItem('buildBox'));
    let boxTotals = [];
    boxData.forEach(element => boxTotals.push(element.quantity));
    let boxCount = boxTotals.reduce((a, b) => a + b, 0);
    $('#boxCount').text(boxCount);
};

async function signIn(email, pass) {
    return await fetch("https://gumi-api-dcln6.ondigitalocean.app/v1/user/sign-in", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Accept": "application/json",
        },
        mode: 'cors',
        body: JSON.stringify({
            email: email,
            password: pass
        })
    }).then(response => response.json())
        .then(async function (res) {
            const date = new Date();
            const minutes = 30;
            date.setTime(date.getTime() + (minutes * 60 * 1000));
            $.cookie('gumiAuth', res.token, { expires: date });
            return await getCustomer(email, res.token);
        })
        .catch(error => console.log('error', error));
}

async function getCustomer(email, token) {
    return await fetch("https://gumi-api-dcln6.ondigitalocean.app/v1/user/get-user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Accept": "application/json",
        },
        mode: 'cors',
        body: JSON.stringify({
            email: email,
            token: token
        })
    }).then(response => response.json())
        .then(async res => {
            return await res;
        })
        .catch(error => console.log('error', error));
}

function checkSignIn() {
    if (signedIn) {

    }
}

function evenRound(num, decimalPlaces) {
    const d = decimalPlaces || 0;
    const m = Math.pow(10, d);
    const n = +(d ? num * m : num).toFixed(8);
    const i = Math.floor(n), f = n - i;
    const e = 1e-8;
    const r = (f > 0.5 - e && f < 0.5 + e) ? ((i % 2 == 0) ? i : i + 1) : Math.round(n); return d ? r / m : r;
}

//global on ready
$(document).ready(function () {

    renderBoxCount();

    $(document)

        //button loaders global
        .on('click', '.button', function () {
            $(this).closest('.button-wrap').find('.button-loader').show();
            setTimeout(function () {
                $('.button-loader').hide();
            }, 3000);
        })

        //prevent body scroll when mobile menu is open
        .on('click', 'mobile-menu-icon', function () {
            if ($('.nav-menu').is(':visible')) {
                $('body').css('overflow', 'hidden');
            } else {
                $('body').css('overflow', 'auto');
            }
        })
        ;
});