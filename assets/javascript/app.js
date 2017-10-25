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

  trainRef.on("child_added", function newTrain(snapshot) {
    console.log(snapshot.val());
    addToTable(snapshot.key, snapshot.val());
  }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  });

  trainRef.on("child_changed", function changeTrain(snapshot) {
    console.log(snapshot.val());
    //TODO: Update row by key
    var elements = $("#" + snapshot.key).children();
    $(elements[0]).text(snapshot.val().name).attr("data-name", snapshot.val().name);
    $(elements[1]).text(snapshot.val().destination).attr("data-dest", snapshot.val().destination);
    $(elements[2]).text(snapshot.val().frequency).attr("data-fq", snapshot.val().frequency);
    var arrival = elements[3];
    var until = elements[4];

    var first = moment(snapshot.val().first, "HH:mm");
    while (first.isBefore(moment())) {
      first.add(snapshot.val().frequency, 'minutes');
    }

    $(elements[3]).text(first.format("h:mm A")).attr("data-next", first);
    $(elements[4]).text(first.fromNow());

  }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  });

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

  $("#updateTrain").on("submit", function updateTrain(event) {
    event.preventDefault();
    var key = event.target.dataset.key;
    database.ref("trains/" + key).update({
      name: event.target.trainName.value.trim(),
      destination: event.target.trainDest.value.trim(),
      first: event.target.trainTime.value,
      frequency: parseInt(event.target.trainFreq.value)
    });
    $("#updateModal").modal("hide");
  });

  $(document).on("click", ".remove", function removeRow(event) {
    event.preventDefault();
    var result = confirm("Are you sure you want to delete this train?");
    if (result) {
      trainRef.child(this.dataset.key).remove();
      $(this).parent().parent().remove();
    }
  });

  $(document).on("click", ".update", function updateRow(event) {
    event.preventDefault();
    database.ref("trains/" + this.dataset.key).once("value").then(function(snapshot) {
      var data = snapshot.val();
      var form = $("#updateTrain")[0];
      form.trainName.value = data.name;
      form.trainDest.value = data.destination;
      form.trainTime.value = data.first;
      form.trainFreq.value = data.frequency;
      $("#updateTrain").attr("data-key", snapshot.key);
      $("#updateModal").modal("show");
    });
  });

  setInterval(updateTimes, 60000);

  function addToTable(key, train) {
    var row = $("<tr>").attr("id", key).attr("data-start", train.first);
    var name = $("<th>").attr("scope", "row").text(train.name).attr("data-name", train.name);
    var dest = $("<td>").text(train.destination).attr("data-dest", train.destination);
    var freq = $("<td>").text(train.frequency).attr("data-fq", train.frequency);
    var arrival = $("<td>");
    var until = $("<td>");
    var btns = $("<td>").addClass("btn-group").attr("role", "group");
    var btnRmv = $("<button>").addClass("remove btn btn-secondary").attr("data-key", key).text("X");
    var btnUpd = $("<button>").addClass("update btn btn-primary").attr("data-key", key).text("Update");
    var first = moment(train.first, "HH:mm");

    while (first.isBefore(moment())) {
      first.add(train.frequency, 'minutes');
    }
    arrival.text(first.format("h:mm A")).attr("data-next", first);
    until.text(first.fromNow());

    btns.append(btnUpd).append(btnRmv);
    row.append(name).append(dest).append(freq).append(arrival).append(until).append(btns);
    $("#timeTrains").append(row);
  }

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

});