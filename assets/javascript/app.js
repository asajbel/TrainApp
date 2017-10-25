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

  trainRef.on("child_added", function(snapshot) {
    console.log(snapshot.val());
    addToTable(snapshot.key, snapshot.val());
    // $("#timeTrains").empty();
    // for (var train in snapshot.val().trains) {
    //   addToTable(snapshot.val().trains[train]);
    // }
  }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  });

  function writeTrainData(name, destination, firstTime, frequency) {
    trainRef.push({
      name: name,
      destination: destination,
      first: firstTime,
      frequency: frequency
    });
  }

  function addToTable(key, train) {
    var row = $("<tr>").attr("id", key).attr("data-start", train.first);
    var name = $("<th>").attr("scope", "row").text(train.name).attr("data-name", train.name);
    var dest = $("<td>").text(train.destination).attr("data-dest", train.destination);
    var freq = $("<td>").text(train.frequency).attr("data-fq", train.frequency);
    var arrival = $("<td>");
    var until = $("<td>");
    var btns = $("<td>");
    var btnRmv = $("<button>").addClass("remove btn btn-secondary").attr("data-key", key).text("X");
    var fq = train.frequency;
    var first = moment(train.first, "HH:mm");

    while (first.isBefore(moment())) {
      first.add(train.frequency, 'minutes');
    }
    arrival.text(first.format("h:mm A")).attr("data-next", first);
    until.text(first.fromNow());

    row.append(name).append(dest).append(freq).append(arrival).append(until).append(btns.append(btnRmv));
    $("#timeTrains").append(row);
  }

  $("#addTrain").on("submit", function getNewTrain(event) {
    event.preventDefault();
    trainRef.push({
      name: event.target.trainName.value.trim(),
      destination: event.target.trainDest.value.trim(),
      first: event.target.trainTime.value,
      frequency: parseInt(event.target.trainFreq.value)
    });
    event.target.reset();
  });

  $(document).on("click", ".remove", function removeRow(event) {
    event.preventDefault();
    trainRef.child(this.dataset.key).remove();
    $(this).parent().parent().remove();
  });

  //Old method to update the times by changing the database when it was using a value event
  // var up = 0;
  // function updateTimes() {
  // 	firebase.database().ref().update({
  // 		update: up
  // 	});
  // 	up++;
  // }
  setInterval(updateTimes, 60000);

});

function updateTimes() {
  var rows = $("#timeTrains").children();
  for (var i = 0; i < rows.length; i++) {
    var elements = $(rows[i]).children();
    var arrival = $(elements[3]);
    var until = $(elements[4]);
    var freq = parseInt(elements[2].dataset.fq);
    var arrive = moment(elements[3].dataset.next, "x");
    while (arrive.isBefore(moment())) {
      arrive.add(freq, 'minutes');
    }
    arrival.text(arrive.format("h:mm A")).attr("data-next", arrive);
    until.text(arrive.fromNow());
  }
}