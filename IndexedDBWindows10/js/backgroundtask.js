// simple background task: wait 1 second, then write 100 entries to the 
// store with 200 ms intervals

(function () {
    "use strict";

    importScripts("db.js");

    function writeData() {
        BgSampleDB.openDb("bg", function (dbObj) {
            BgSampleDB.writeData(dbObj, null, function (dbObj) {
                close();
            }, console.error);
        }, console.error);
    }

    setTimeout(writeData, 1000);
})();