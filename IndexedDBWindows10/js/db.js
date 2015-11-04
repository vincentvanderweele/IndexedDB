BgSampleDB = (function () {
    "use strict";

    var DB_NAME = "SampleDB";
    var STORE_NAME = "items";

    function initDb(context, complete, error) {
        // remove old db if it already exists, then create new one
        deleteDb(context, function () {
            createDb(context, complete, error);
        });
    }

    // create a db with single store having auto-incrementing key
    function createDb(context, complete, error) {
        console.log(context, "Create DB");
        var createRequest = window.indexedDB.open(DB_NAME, 1);
        createRequest.onerror = error;
        createRequest.onupgradeneeded = function (evt) {
            var db = evt.target.result;
            evt.target.transaction.oncomplete = complete.bind(null, { context: context, db: db });
            db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        }
    }
        
    function deleteDb(context, complete) {
        console.log(context, "Delete DB");
        var deleteRequest = window.indexedDB.deleteDatabase(DB_NAME);
        deleteRequest.onsuccess = complete;
        deleteRequest.onerror = complete;   // ignore failures
    }

    // open existing db (for bg writes)
    function openDb(context, complete, error) {        
        var dbRequest = indexedDB.open(DB_NAME, 1);
        dbRequest.onsuccess = function (evt) {
            console.log(context, "Open DB");
            complete({ context: context, db: evt.target.result });
        };
        dbRequest.onerror = error;        
    }

    // read all data from the database
    function readData(dbObj, complete, error) {
        var txn = dbObj.db.transaction([STORE_NAME], "readonly");
        var store = txn.objectStore(STORE_NAME);

        var items = [];

        txn.oncomplete = complete.bind(null, items);

        var cursorRequest = store.openCursor();
        cursorRequest.onerror = error;
        cursorRequest.onsuccess = function (evt) {
            var cursor = evt.target.result;
            if (cursor) {
                items.push(JSON.stringify(cursor.value));
                cursor.continue();
            }
        };        
    }

    // write 100 entries with 200 ms intervals
    // let the key auto-increment
    function writeData(dbObj, progress, complete, error) {
        console.log(dbObj.context, "Write data");
        var writeLoop = function (remaining) {
            if (remaining > 0) {
                if (progress) progress(remaining);
                var tx = dbObj.db.transaction([STORE_NAME], "readwrite");
                tx.onerror = logError.bind(null, dbObj.context, "Transaction error");
                tx.onabort = logError.bind(null, dbObj.context, "Transaction aborted");
                var addRequest = tx.objectStore(STORE_NAME).add({ timestamp: Date.now(), context: dbObj.context });
                addRequest.onerror = logError.bind(null, dbObj.context, "Add error");

                setTimeout(writeLoop.bind(null, remaining - 1), 200);
            } else {
                complete(dbObj);
            }
        }

        writeLoop(100);
    }

    function logError(context, action, e) {
        console.log(context, action, e.target.error.name);
    }

    return {
        initDb: initDb,
        openDb: openDb,
        readData: readData,
        writeData: writeData,
    }
})();

// wrap in promises for fg convenience
if (this.WinJS) {
    WinJS.Namespace.define("SampleDB", {
        initDb: function (context) { return new WinJS.Promise(BgSampleDB.initDb.bind(null, context)); },        
        readData: function (dbObj) { return new WinJS.Promise(BgSampleDB.readData.bind(null, dbObj)); },
        writeData: function (dbObj, progress) { return new WinJS.Promise(BgSampleDB.writeData.bind(null, dbObj, progress)); },
    });
}