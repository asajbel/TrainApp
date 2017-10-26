/**
 * Function called when clicking the Login/Logout button.
 */
// [START buttoncallback]
function toggleSignIn(event) {
  event.preventDefault();
  if (!firebase.auth().currentUser) {
    // [START createprovider]
    var provider = new firebase.auth.GoogleAuthProvider();
    // [END createprovider]
    // [START addscopes]
    // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    // [END addscopes]
    // [START signin]
    firebase.auth().signInWithPopup(provider).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // [START_EXCLUDE]
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert('You have already signed up with a different auth provider for that email.');
        // If you are using multiple auth providers on your app you should handle linking
        // the user's accounts here.
      } else {
        console.error(error);
      }
      // [END_EXCLUDE]
    });
    // [END signin]
  } else {
    // [START signout]
    firebase.auth().signOut();
    // [END signout]
  }
}
// [END buttoncallback]

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
  var next = arrivalTime(train.frequency, train.first);

  arrival.text(next.format("h:mm A")).attr("data-next", next);
  until.text(next.fromNow());
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

function arrivalTime(freq, first, format = "HH:mm") {
  var arrive = moment(first, format);
  if (arrive.isBefore(moment())) {
    var diff = moment().diff(moment(arrive), "minutes");
    var till = freq - (diff % freq);
    arrive = moment().add(till, "minutes");
  }
  return arrive;
}

function newTrain(snapshot) {
  console.log(snapshot.val());
  addToTable(snapshot.key, snapshot.val());
}

function changeTrain(snapshot) {
  console.log(snapshot.val());
  var elements = $("#" + snapshot.key).children();
  $(elements[0]).text(snapshot.val().name).attr("data-name", snapshot.val().name);
  $(elements[1]).text(snapshot.val().destination).attr("data-dest", snapshot.val().destination);
  $(elements[2]).text(snapshot.val().frequency).attr("data-fq", snapshot.val().frequency);
  var arrival = elements[3];
  var until = elements[4];
  var next = arrivalTime(snapshot.val().frequency, snapshot.val().first)

  $(elements[3]).text(next.format("h:mm A")).attr("data-next", next);
  $(elements[4]).text(next.fromNow());

}


$(document).ready(function initialize() {
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

  // Listening for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;
      // [START_EXCLUDE]
      $("#signInText").text('Sign out');
      trainRef = database.ref("/trains" + uid);
      $("#timeTrains").empty();
      trainRef.off("child_added");
      trainRef.off("child_changed");
      trainRef.on("child_added", newTrain, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
      });

      trainRef.on("child_changed", changeTrain, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
      });
      // [END_EXCLUDE]
    } else {
      // User is signed out.
      // [START_EXCLUDE]
      $("#signInText").text('Sign In');
      trainRef = database.ref("/trains");
      switchTrains();
      // [END_EXCLUDE]
    }
    // [START_EXCLUDE]
    // [END_EXCLUDE]
  });
  // [END authstatelistener]

	function switchTrains(){
      $("#timeTrains").empty();
      trainRef.off("child_added");
      trainRef.off("child_changed");
      trainRef.on("child_added", newTrain, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
      });

      trainRef.on("child_changed", changeTrain, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
      });
	}

  $("#signIn").on("click", toggleSignIn);


  // trainRef.on("child_added", newTrain, function(errorObject) {
  //   console.log("Errors handled: " + errorObject.code);
  // });

  // trainRef.on("child_changed", changeTrain, function(errorObject) {
  //   console.log("Errors handled: " + errorObject.code);
  // });

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
    trainRef.child(event.target.dataset.key).update({
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
    trainRef.child(this.dataset.key).once("value").then(function(snapshot) {
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

  var update = setInterval(updateTimes, 60000);

});