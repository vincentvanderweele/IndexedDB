(function () {
	"use strict";    

	var taskName = "SampleDBBackgroundTask";

	function unregisterBackgroundTask() {
	    var iter = Windows.ApplicationModel.Background.BackgroundTaskRegistration.allTasks.first();
	    if (!iter.hasCurrent) return;
	    do {
	        if (iter.current.value.name === taskName) iter.current.value.unregister(true);
	    } while (iter.moveNext());
	}

	function registerBackgroundTask() {
	    var builder = new Windows.ApplicationModel.Background.BackgroundTaskBuilder();
	    builder.name = taskName;
	    builder.taskEntryPoint = "js\\backgroundtask.js";
	    builder.setTrigger(new Windows.ApplicationModel.Background.SystemTrigger(Windows.ApplicationModel.Background.SystemTriggerType.timeZoneChange, false));
	    builder.register();
	}

	function showProgress(remaining) {
	    document.getElementById("dataOutput").innerHTML = "Remaining writes: " + remaining;
	}

	function writeAndRead(dbObj) {
	    return SampleDB.writeData(dbObj, showProgress)
            .then(SampleDB.readData, console.error)
            .then(function(items) {
                document.getElementById("dataOutput").innerHTML = items.join("<br/>");
            }, console.error);
	}

	var app = WinJS.Application;
	var activation = Windows.ApplicationModel.Activation;

	app.onactivated = function (args) {
	    unregisterBackgroundTask();
	    registerBackgroundTask();

	    SampleDB.initDb("fg")
            .then(function (dbObj) {
                console.log("Sample DB initialized");
                document.getElementById("startButton").addEventListener("click", writeAndRead.bind(null, dbObj), false);
                console.log("Ready to accept button click");
            }, console.error);
	};    

	app.start();
})();
