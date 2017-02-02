//config file for Firebase
var config = {
    apiKey: "AIzaSyC24POCXRxkMSN_Bf1FtlVmdb8PsdNRY2I",
    authDomain: "rps-multiplayer-4efac.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-4efac.firebaseio.com",
    storageBucket: "rps-multiplayer-4efac.appspot.com",
    messagingSenderId: "601451583285"
};
//initialize firebase
firebase.initializeApp(config);

//shorten code and improve readability
var database = firebase.database();

//array to limit number of players
var currentPlayers = [];
var currentUser;
var playerCount = 0;

//declare names for player1's name, choice, and score
var p1Name = "Player 1";
var p1Choice = "";
var p1Score = 0;

//declare names for player2's name, choice, and score
var p2Name = "Player 2";
var p2Choice = "";
var p2Score = 0;

//declare variable for ties
var pTies = 0;

//default message to display at beginning of game
var message = "This is the beginning of your conversation";

//default message to display while waiting for players to make their choices
var p1Status = "Waiting for response";
var p2Status = "Waiting for response";
var winner;






//on click function to log out the user
//----------------------------------------------
//---------------    TO DO    ------------------
//----------------------------------------------
//remove user uid from the currentPlayers array
$("#logout").on("click", function() {
    var playerSpot = currentPlayers.indexOf(currentUser);
    if (playerSpot > -1) {
        delete currentPlayers[playerSpot];
        console.log(currentPlayers);
        // database.ref("/users").set({
        //     currentPlayers: currentPlayers
        // });
    }
    firebase.auth().signOut();
    console.log("User logged out")
});



$("#userLogin").on("click", function() {
    firebase.auth().signInAnonymously();


});
//if the auth state changes then:
firebase.auth().onAuthStateChanged(firebaseUser => {
    //takes the users uid and set it to current user
    if (firebaseUser) {

        if (playerCount == 0) {
            $("#gameArea").removeClass("hidden");
            $("#loginArea").addClass("hidden");
            $("#logout").removeClass("hidden")
            currentUser = firebaseUser.uid;
            // currentPlayers.push(currentUser);

            database.ref("/users").push({
                currentUser
            });

            username = $("#username").val().trim();
            p1Name = username;
            console.log("Logged in Player 1 as " + username);
            console.log("players logged in is now: " + currentPlayers.length);
            console.log(currentUser);

            database.ref("/players").update({
                player1: {
                    // uid: uid,
                    username: username,
                    score: p1Score,
                    choice: "",
                    status: "Waiting on response"
                }
            });





        } else if (playerCount == 1) {
            $("#gameArea").removeClass("hidden");
            $("#loginArea").addClass("hidden");
            $("#logout").removeClass("hidden")
            currentUser = firebaseUser.uid;
            currentPlayers.push(currentUser);

            database.ref("/users").push({
                currentUser
            });

            username = $("#username").val().trim();
            p2Name = username;
            console.log("Logged in Player 2 as " + username);
            console.log("players logged in is now: " + currentPlayers.length);
            console.log(currentUser);

            database.ref("/players").update({
                player2: {
                    // uid: uid,
                    username: username,
                    score: p2Score,
                    choice: "",
                    status: "Waiting on response"
                }
            });
        } else {
            console.log("There are already 2 players playing. Try again soon!");
            tooManyModal();
        }

        console.log(firebaseUser);
        // $("#userLogin").addClass("hidden");
        // $("#gameArea").removeClass("hidden");

        //pushes the currentUser uid to the currentPlayers array
        console.log(currentPlayers);

        // database.ref("/users").set({
        //     currentPlayers: currentPlayers
        // });

        // console.log(firebaseUser.displayName);
    } else {
        //if logging out - hides the game div, and displays the user log in page again
        console.log("Not logged in!");

        // $("#userLogin").removeClass("hidden");
        // $("#gameArea").addClass("hidden");


    }
});

//reset the game in between rounds
// function startRound() {
//     console.log('Reset');
//     p1Choice = "";
//     p2Choice = "";
//     p1Status = "Waiting for response";
//     p2Status = "Waiting for response";
//     updateServer();

// };
//run it at app startup
startRound();

//writes the changes to the server to the appropriate section.
function startRound() {
    database.ref("/players").update({
        player1: {
            username: p1Name,
            score: p1Score,
            choice: "",
            status: "Waiting on response"
        },
        player2: {
            username: p2Name,
            score: p2Score,
            choice: "",
            status: "Waiting on response"
                // ties: ties
        }
    });
    // database.ref("/users").set({
    //     currentPlayers: currentPlayers
    // });
};




//changes player1's choice to generic names "rock", "paper", or "scissor" 
//for easier comparison and sets the status to "Locked in"
$('#p1Rock, #p1Paper, #p1Scissor').click(function() {
    if (this.id === "p1Rock") {
        p1Choice = "rock";
        p1Status = p1Name + " is locked in!";
    } else if (this.id === "p1Paper") {
        p1Choice = "paper";
        p1Status = p1Name + " is locked in!";
    } else if (this.id === "p1Scissor") {
        p1Choice = "scissor";
        p1Status = p1Name + " is locked in!";
    }
    //writes player1's choice and status to the server
    database.ref("/players/player1").update({
        choice: p1Choice,
        status: p1Status
    });
});

//changes player2's choice to generic names "rock", "paper", or "scissor" 
//for easier comparison and sets the status to "Locked in"
$('#p2Rock, #p2Paper, #p2Scissor').click(function() {
    if (this.id === "p2Rock") {
        p2Choice = "rock";
        p2Status = p2Name + " is locked in!";
    } else if (this.id === "p2Paper") {
        p2Choice = "paper";
        p2Status = p2Name + " is locked in!";
    } else if (this.id === "p2Scissor") {
        p2Choice = "scissor";
        p2Status = p2Name + " is locked in!";
    }
    //writes player2's choice and status to the server
    database.ref("/players/player2").update({
        choice: p2Choice,
        status: p2Status
    });
});


database.ref("/users").on("value", function(snapshot) {
    playerCount = snapshot.numChildren();
    console.log(playerCount + " players currently playing");
})

//beginning the logic to compare the players choices 
database.ref("/players").on("value", function(snapshot) {
    //setting variables to shorten code and improve readability
    p1Name = snapshot.val().player1.username;
    p2Name = snapshot.val().player2.username;
    var p1 = snapshot.val().player1.choice;
    var p2 = snapshot.val().player2.choice;
    p1Status = snapshot.val().player1.status;
    p2Status = snapshot.val().player2.status;

    //logging to check for bugs
    console.log(p1);
    console.log(p2);

    //puts game on hold until both players have chosen an option
    if (p1 == "" || p2 == "") {
        console.log("Waiting for other player");
    } else {
        //once both have chosen then compare choices
        console.log("Game on!");
        //check for tie first
        if (p1 === p2) {
            console.log("tie!");
            winner = "Tie!";
            showResultsModal(p1Name, p1, p2Name, p2, winner);
            pTies++;

            //checks the balance of the options and update scores accordingly
        } else if (p1 === "rock" && p2 === "scissor") {
            console.log("Player 1 Wins!");
            winner = p1Name + " wins!!";
            showResultsModal(p1Name, p1, p2Name, p2, winner);
            p1Score++;
        } else if (p1 === "rock" && p2 === "paper") {
            console.log("Player 2 Wins!");
            winner = p2Name + " wins!!";
            showResultsModal(p1Name, p1, p2Name, p2, winner);
            p2Score++;
        } else if (p1 === "paper" && p2 === "rock") {
            console.log("Player 1 Wins!");
            winner = p1Name + " wins!!";
            showResultsModal(p1Name, p1, p2Name, p2, winner);
            p1Score++;
        } else if (p1 === "paper" && p2 === "scissor") {
            console.log("Player 2 Wins!");
            winner = p2Name + " wins!!";
            showResultsModal(p1Name, p1, p2Name, p2, winner);
            p2Score++;
        } else if (p1 === "scissor" && p2 === "paper") {
            console.log("Player 1 Wins!");
            winner = p1Name + " wins!!";
            showResultsModal(p1Name, p1, p2Name, p2, winner);
            p1Score++;
        } else if (p1 === "scissor" && p2 === "rock") {
            console.log("Player 2 Wins!");
            winner = p2Name + " wins!!";
            showResultsModal(p1Name, p1, p2Name, p2, winner);
            p2Score++;
        }

        //refresh the round
        // startRound();
    }
    //write results to the DOM
    $("#p1NameTitle").html(p1Name);
    $("#p2NameTitle").html(p2Name);
    $("#p1Score").html("<h4><strong>" + p1Name + ":</strong> " + p1Score + "</h4>");
    $("#pTies").html("<h4><strong>" + "Ties: </strong>" + pTies + "</h4>");
    $("#p2Score").html("<h4><strong>" + p2Name + ": </strong>" + p2Score + "</h4>");
    $("#p1Status").html("<h4>" + p1Status + "</h4>");
    $("#p2Status").html("<h4>" + p2Status + "</h4>");
});

////////////////////////////////////////
//  starting code for the chat block  //
////////////////////////////////////////

//keeps the char block always scrolled to the bottom and pushes old messages up
function scrollChat() {
    $("#chatLog").animate({
        scrollTop: $(document).height()
    }, "slow");
    return false;
};

function tooManyModal() {
    $("#tooManyModal").modal('show');
    setTimeout(dismiss, 3000);
    function dismiss() {
        $("#tooManyModal").modal('hide');
    };
};

function showResultsModal(p1Name, p1Choice, p2Name, p2Choice, winner) {
    $("#modalContent").html("<h3>Rock...</h3>");
    $('#rpsModal').modal('show');
    setTimeout(paper, 1000);

    function paper() {
        $("#modalContent").html("<h3>Rock... Paper...</h3>");
    };
    setTimeout(scissors, 2000);

    function scissors() {
        $("#modalContent").html("<h3>Rock... Paper... Scissors...</h3>");
    };
    setTimeout(shoot, 3000);

    function shoot() {
        $("#modalContent").html("<h1><b>SHOOT!!</b></h1>");
    };
    setTimeout(results, 4000);

    function results() {
        $("#modalContent").html("<h1>" + winner + "</h1><br><h4><b>" + p1Name + "</b> chose <i>" + p1Choice + "</i> <br> <b>" + p2Name + "</b> chose <i>" + p2Choice + "</i>.");
    };
    setTimeout(dismiss, 7000);

    function dismiss() {
        $("#rpsModal").modal('hide');
        startRound();

    };
};

//actively look for changes in the chat and update in real time
database.ref("/chat").on("value", function(snapshot) {
    $("#chatLog").append("<p>" + snapshot.val().user + ": " + snapshot.val().message + "</p>");
    scrollChat();
    $('form')[1].reset();
    message = "";
});

//on click function to send a message to the chat
//----------------------------------------------
//---------------    TO DO    ------------------
//----------------------------------------------
//change username to display from the login screen
$("#btnSend").on("click", function() {
    message = $("#chatInput").val().trim();
    database.ref("/chat").set({
        user: "annon",
        message: message
    });

    //always make sure the chat is at the bottom of the screen
    scrollChat();
});




//things left to do:
//  1. connect "sides" to players
//      player 1 cant hit player 2's buttons
//  2. get chat to display correct users player name
//  3. get log out button to work!!!!
