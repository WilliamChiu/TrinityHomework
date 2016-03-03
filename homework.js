var url = window.location.href; //https://trinityschoolnyc.myschoolapp.com/podium/feed/iCal.aspx?q=C6FFDF411193582890253A1FB7D8D635B859FB0C1DEA02F192200DC1DE62849D52E80831949CDAE62DE3508FF8109720E4916D43853867002E117FA08C1FC1FC
var calData;
var td = new Date();
var dd = td.getDate();
var mm = td.getMonth() + 1; //January is 0!
var yyyy = td.getFullYear();
if (dd < 10) {
    dd = '0' + dd;
}
if (mm < 10) {
    mm = '0' + mm;
}

var date = yyyy + '' + mm + '' + dd;

//console.log(date);

var strData = 'DTSTAMP:20110914T184000Z'
var x = strData.indexOf(":");
var strVal = strData.slice(x + 1);

//URL Check. If theres no Trinity username, it goes to the setup.
function startGenerator() {
    if (url.indexOf("trinity") != -1) {
        url = url.substring(url.indexOf("trinity"), url.length);
        url = "https://" + url;
        generateSchedulePage();
    }
    else generateSetupPage();
}

function generateSetupPage() {
    var setupBox = document.createElement("div");
    setupBox.setAttribute('class', 'box');
    var step1 = document.createElement("p");
    step1.setAttribute('class', 'heading');
    step1.innerHTML = 'Paste your Feed URL';
    setupBox.appendChild(step1);
    var linkBox = document.createElement("input");
    linkBox.setAttribute('class', 'textbox');
    linkBox.type = "text";
    linkBox.setAttribute("onChange", "generateLink();");
    setupBox.appendChild(linkBox);
    document.body.appendChild(setupBox);
}

function generateLink() {
    var newURL = document.createElement("a");
    newURL.href = window.location.href + "?" + document.getElementsByTagName("input")[0].value;
    newURL.setAttribute('class', 'box button');
    newURL.innerHTML = "This is your new homework link!";
    document.body.appendChild(newURL);
}

function generateSchedulePage() {
    $.ajax({
        type: 'GET',
        url: 'https://query.yahooapis.com/v1/public/yql?q=select%20content%20from%20data.headers%20where%20url%3D%22' + encodeURIComponent(url) + '%22&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
        dataType: 'text',
        success: function(data) {
            calData = data;
            parseEvents();
        },
        error: function() {
            alert('Uh Oh!');
        },
    });
}

function writeData() {
    document.write(calData);
}

function parseEvents() {
    //console.log(calData);
    var numEvents = calData.split("BEGIN:VEVENT").length - 1;
    var dtstart = [];
    var dtend = [];
    var summary = [];
    var description = [];

    var eventStart = 0;
    for (i = 0; i < numEvents; i++) {
        var dtstartloc = calData.indexOf("DTSTART;VALUE=DATE:", eventStart) + 19;
        dtstart[i] = calData.substring(dtstartloc, dtstartloc + 8);

        var dtendloc = calData.indexOf("DTEND;VALUE=DATE:", eventStart) + 17;
        dtend[i] = (parseInt(calData.substring(dtendloc, dtendloc + 8)) - 1) + "";

        var summaryloc = calData.indexOf("SUMMARY:", eventStart) + 8;
        var descriptionloc = calData.indexOf("DESCRIPTION:", eventStart);
        var statusloc = calData.indexOf("STATUS:", eventStart);

        if (descriptionloc != -1 && descriptionloc < statusloc) {
            summary[i] = decodeHtml(calData.substring(summaryloc, descriptionloc - 1)).replace('  ', '</br>');
            description[i] = decodeHtml(calData.substring(descriptionloc + 12, statusloc - 1)).replace('  ', '</br>');
        } else {
            summary[i] = decodeHtml(calData.substring(summaryloc, statusloc - 1)).replace('  ', '</br>');
        }
        eventStart = statusloc + 1;
    }

    //console.log(dtstart);
    //console.log(dtend);
    //console.log(summary);
    //console.log(description);
    for (i = 0; i < dtstart.length; i++) {
        if (dtend[i] === date) {
            var assignment = document.createElement("div");
            assignment.setAttribute("class", "box");
            var header = document.createElement("p");
            header.setAttribute("class", "heading2");
            header.innerHTML = (dtend[i] + ':  ' + summary[i]);
            var description = document.createElement("p");
            description.innerHTML = ((description[i] != undefined ? ("<br>" + description[i]) : ""));
            assignment.appendChild(header);
            assignment.appendChild(description);
            document.body.appendChild(assignment);
        }
    }

}

function calenDate(icalStr) {
    // icalStr = '20110914T184000Z'             
    var strYear = icalStr.substr(0, 4);
    var strMonth = icalStr.substr(4, 2);
    var strDay = icalStr.substr(6, 2);
    var strHour = icalStr.substr(9, 2);
    var strMin = icalStr.substr(11, 2);
    var strSec = icalStr.substr(13, 2);
    var oDate = new Date(strYear, strMonth, strDay, strHour, strMin, strSec)
    return oDate;
}

function decodeHtml(html) { //http://stackoverflow.com/questions/7394748/whats-the-right-way-to-decode-a-string-that-has-special-html-entities-in-it
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    //console.log(html);
    return txt.value;
}
