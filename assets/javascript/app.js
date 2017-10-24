$(document).ready(function() {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDUtsL3aGb_X7m5fyueXRSiJJeR_XgDEQg",
        authDomain: "bootcampclass-d491b.firebaseapp.com",
        databaseURL: "https://bootcampclass-d491b.firebaseio.com",
        projectId: "bootcampclass-d491b",
        storageBucket: "bootcampclass-d491b.appspot.com",
        messagingSenderId: "531440901597"
    };
    firebase.initializeApp(config);

    var database = firebase.database();
    var trainRef = database.ref("/trains");

    database.ref().on("value", function(snapshot) {
        console.log(snapshot.val());
        $("#timeTrains").empty();
        for (var train in snapshot.val().trains) {
            addToTable(snapshot.val().trains[train]);
        }
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });

    function writeTrainData(name, destination, firstTime, frequency) {
        // var newTrainKey = trainRef.push().key;

        // trainRef.child(newTrainKey).set({
        trainRef.push({
            name: name,
            destination: destination,
            first: firstTime,
            frequency: frequency
        });
    }

    function addToTable(train) {
        var row = $("<tr>");
        var name = $("<th>").attr("scope", "row").text(train.name);
        var dest = $("<td>").text(train.destination);
        var freq = $("<td>").text(train.frequency);
        var arrival = $("<td>");
        var until = $("<td>");
        var fq = train.frequency;
        var now = moment();
        var hr = train.first.split(":")[0];
        var min = train.first.split(":")[1];
        var first = moment().hour(hr).minute(min);


        while (first.isBefore(now)) {
            first.add(train.frequency, 'minutes');
        }
        var diff = moment.duration(first.diff(now));
        arrival.text(first.format("h:mm A"));
        until.text(Math.floor(diff.asMinutes()));
        row.append(name).append(dest).append(freq).append(arrival).append(until);
        $("#timeTrains").append(row);
    }

    $("#addTrain").on("submit", function getNewTrain(event) {
        event.preventDefault();
        var name = event.target.trainName.value.trim();
        var dest = event.target.trainDest.value.trim();
        var start = event.target.trainTime.value;
        var freq = parseInt(event.target.trainFreq.value);
        writeTrainData(name, dest, start, freq);
        event.target.reset();
    });

    var up = 0;
    function updateTimes() {
    	firebase.database().ref().update({
    		update: up
    	});
    	up++;
    }
    setInterval(updateTimes, 60000);

});