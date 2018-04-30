/*

Welcome to the pong game
*/

// ball
var movingString = {
  word: "O",
  x: 100,
  y: 100,
  xDirection: 1, //+1 for leftwards, -1 for rightwards
  yDirection: 1, //+1 for downwards, -1 for upwards
  stringWidth: 50, //will be updated when drawn
  stringHeight: 24
}; //assumed height based on drawing point size

//intended for keyboard control
var movingBox = { // paddle 1 on the left
  x: 50,
  y: 50,
  width: 10,
  height: 100
};
var movingBox2 = { // paddle on the left
  x: 500,
  y: 50,
  width: 10,
  height: 100
};

var line = {
  x: 290,
  y: 000,
  width: 10,
  height: 400
};
var wayPoints = []; //locations were this client moved the box to

var timer; //used to control the free moving word
var pollingTimer; //timer to poll server for location updates
var points1 = 0;
var points2 = 0; // points for the 2 paddles

var wordBeingMoved; //word being dragged by mouse
var wordTargetRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
}; //bounding box around word being targeted
var points1 = 0;
var deltaX, deltaY; //location where mouse is pressed
var canvas = document.getElementById("canvas1"); //our drawing canvas
var fontPointSize = 18; //point size for word text
var wordHeight = 20; //estimated height of a string in the editor
var editorFont = "Arial"; //font for your editor
var points1 = 0;
var points2 = 0;


var drawCanvas = function() {
  var context = canvas.getContext("2d");

  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height); //erase canvas

  context.font = "" + fontPointSize + "pt " + editorFont;
  context.fillStyle = "cornflowerblue";
  context.strokeStyle = "blue";



  movingString.stringWidth = context.measureText(movingString.word).width;
  context.fillText(movingString.word, movingString.x, movingString.y);

  //draw moving box
  context.fillRect(line.x, line.y, line.width, line.height);
  context.fillRect(movingBox.x, movingBox.y, movingBox.width, movingBox.height);
  context.fillRect(movingBox2.x, movingBox2.y, movingBox2.width, movingBox2.height);

  context.font = "" + fontPointSize + "pt " + editorFont;
  context.fillStyle = "blue";
  context.strokeStyle = "blue";

  context.fillText("Score1:" + points1, 50, 40);
  //context.strokeText("Score: " + points1, 40, 40);

  context.fillStyle = "red";
  context.strokeStyle = "red";

  context.fillText("Score2: " + points2, 400, 300);
  //  context.strokeText("Score: " + points2, 30, 30);


  //draw box around word last targeted with mouse -for debugging
  context.strokeStyle = "red";
  context.strokeRect(
    wordTargetRect.x,
    wordTargetRect.y,
    wordTargetRect.width,
    wordTargetRect.height
  );
};


//JQuery Ready function -called when HTML has been parsed and DOM
//created
//can also be just $(function(){...});
//much JQuery code will go in here because the DOM will have been loaded by the time
//this runs

function handleTimer() { // controlled by x direction

  movingString.x = movingString.x + 5 * movingString.xDirection;
  movingString.y = movingString.y + 5 * movingString.yDirection;

  //keep moving word within bounds of canvas ADD MORE CONDIDTIONS TO THE
  if (movingString.x + movingString.stringWidth > canvas.width)
    movingString.xDirection = -1;
  if (movingString.x < 0) movingString.xDirection = 1;
  if (movingString.y > canvas.height) movingString.yDirection = -1;
  if (movingString.y - movingString.stringHeight < 0)
    movingString.yDirection = 1;
  // got from https://robots.thoughtbot.com/pong-clone-in-javascripts

  /*  if(movingString.y < (movingBox.y + movingBox.height) && movingString.y> movingBox.y
     && movingBox.x < (movingBox.x + movingBox.width) && movingString.x > movingBox.x){
      movingString.xDirection = -1;
      console.log("bounce");

    }*/

  if (movingString.x < (movingBox.width + movingBox.x) && movingString.y < (movingBox.y + movingBox.height)) {
    movingString.xDirection = 1;
  }
  if (movingString.x > (movingBox2.x - movingBox2.width) && movingString.y < (movingBox2.y + movingBox2.height)) {
    movingString.xDirection = -1;

  }
  if (movingString.x < 0) {
    points1++;
    movingString.x = 200;
    movingString.y = 300;
    movingString.xDirection = -1;
    var scoreData = {
      score1: points1,
      score2: points2
    };
    var scoreSend = JSON.stringify(scoreData);
    socket.emit('scoreData', scoreSend);


  }
  if (movingString.x > 570) {
    points2++;
    movingString.x = 200;
    movingString.y = 300;
    movingString.xDirection = 1;
    var scoreData = {
      score1: points1,
      score2: points2
    };
    var scoreSend = JSON.stringify(scoreData);
    socket.emit('scoreData',scoreSend);

  }
  var dataObj = {
    x: movingString.x,
    y: movingString.y,
  };
  var jsonString = JSON.stringify(dataObj);
  socket.emit('ballData', jsonString);
}


//   if (movingString.x >canvas.length) {

//      movingString.x = 200;
//       movingString.y = 300;


//    }


drawCanvas();

//KEY CODES
//should clean up these hard coded key codes
var RIGHT_ARROW = 39;
var LEFT_ARROW = 37;
var UP_ARROW = 38;
var DOWN_ARROW = 40;
var W_KEY = 87;
var S_KEY = 83;
var A_KEY = 65;
var D_KEY = 68;


/*
function pollingTimerHandler() {
  //console.log("poll server");
  var dataObj = { x: -1, y: -1 }; //used by server to react as poll
  //create a JSON string representation of the data object
  var jsonString = JSON.stringify(dataObj);

  //Poll the server for the location of the moving box
  $.post("positionData", jsonString, function(data, status) {
    console.log("data: " + data);
    console.log("typeof: " + typeof data);
    //var locationData = JSON.parse(data);
    var locationData = data;
    movingBox.x = locationData.x;
    movingBox.y = locationData.y;
  });
}
*/

function handleKeyDown(e) {
  console.log("keydown code = " + e.which);

  var dXY = 5; //amount to move in both X and Y direction
  if (e.which == UP_ARROW && movingBox.y >= dXY) {
    movingBox.y -= dXY; //up arrow
    var dataObj = {
      x: movingBox.x,
      y: movingBox.y,

    };
    //create a JSON string representation of the data object
    var jsonString = JSON.stringify(dataObj);

    //update the server with a new location of the moving box
    socket.emit('blueBoxData', jsonString);
  }

  if (e.which == DOWN_ARROW && movingBox.y + movingBox.height + dXY <= canvas.height) {
    movingBox.y += dXY; //down arrow
    var dataObj = {
      x: movingBox.x,
      y: movingBox.y,


    };
    //create a JSON string representation of the data object
    var jsonString = JSON.stringify(dataObj);

    //update the server with a new location of the moving box
    socket.emit('blueBoxData', jsonString);
  }
  if (e.which == LEFT_ARROW && movingBox.y + movingBox.height + dXY <= canvas.height) {
    movingBox.x -= dXY; //down arrow
    var dataObj = {
      x: movingBox.x,
      y: movingBox.y,


    };
    //create a JSON string representation of the data object
    var jsonString = JSON.stringify(dataObj);

    //update the server with a new location of the moving box
    socket.emit('blueBoxData', jsonString);
  }
  if (e.which == RIGHT_ARROW && movingBox.y + movingBox.height + dXY <= canvas.height) {
    movingBox.x += dXY; //down arrow
    var dataObj = {
      x: movingBox.x,
      y: movingBox.y,


    };
    //create a JSON string representation of the data object
    var jsonString = JSON.stringify(dataObj);

    //update the server with a new location of the moving box
    socket.emit('blueBoxData', jsonString);
  }
  //amount to move in both X and Y direction
  if (e.which == W_KEY && movingBox2.y >= dXY) {

    movingBox2.y -= dXY;
    var dataObj = {
      x: movingBox2.x,
      y: movingBox2.y,


    };
    //create a JSON string representation of the data object
    var jsonString = JSON.stringify(dataObj);

    //update the server with a new location of the moving box
    socket.emit('blueBox2Data', jsonString);
  }
  if (e.which == S_KEY && movingBox2.y + movingBox2.height + dXY <= canvas.height) {
    movingBox2.y += dXY;
    var dataObj = {

      x: movingBox2.x,
      y: movingBox2.y

    };
    //create a JSON string representation of the data object
    var jsonString = JSON.stringify(dataObj);

    //update the server with a new location of the moving box
    socket.emit('blueBox2Data', jsonString);
  }
  if (e.which == A_KEY && movingBox2.y + movingBox2.height + dXY <= canvas.height) {
    movingBox2.x += dXY;
    var dataObj = {

      x: movingBox2.x,
      y: movingBox2.y

    };
    //create a JSON string representation of the data object
    var jsonString = JSON.stringify(dataObj);

    //update the server with a new location of the moving box
    socket.emit('blueBox2Data', jsonString);
  }
  if (e.which == D_KEY && movingBox2.y + movingBox2.height + dXY <= canvas.height) {
    movingBox2.x -= dXY;
    var dataObj = {

      x: movingBox2.x,
      y: movingBox2.y

    };
    //create a JSON string representation of the data object
    var jsonString = JSON.stringify(dataObj);

    //update the server with a new location of the  paddle
    socket.emit('blueBox2Data', jsonString);
  }
  //down arrow
  //upate server with position data
  //may be too much traffic?

  /*
  $.post("positionData", jsonString, function(data, status) {
    //do nothing
  });
  */
}

function handleKeyUp(e) {
  console.log("key UP: " + e.which);

  var dataObj = {

    x: movingBox.x,
    y: movingBox.y

  };
  var dataObj2 = {

    x: movingBox2.x,
    y: movingBox2.y

  };
  var jsonString = JSON.stringify(dataObj);
  var jsonString2 = JSON.stringify(dataObj2);
  socket.emit('blueBoxData', jsonString);
  socket.emit('blueBox2Data', jsonString2);

};



//connect to server and retain the socket
var socket = io('http://' + window.document.location.host);
//var socket = io('http://localhost:3000')
// update the paddle data
socket.on('blueBoxData', function(data) {
//  console.log("data: " + data);
//  console.log("typeof: " + typeof data);
  var locationData = JSON.parse(data);

  //var locationData = data;
  movingBox.x = locationData.x;
  movingBox.y = locationData.y;
  drawCanvas();
});
// update the ball
socket.on('blueBox2Data', function(data) {
  //console.log("data: " + data);
//  console.log("typeof: " + typeof data);
  //var locationData = JSON.parse(data);
  var locationData = JSON.parse(data);
  //var locationData = data;
  movingBox2.x = locationData.x;
  movingBox2.y = locationData.y;
  drawCanvas();
});

// update the ball
socket.on('ballData', function(data) {
  //console.log("data: " + data);
//  console.log("typeof: " + typeof data);
  //var locationData = JSON.parse(data);
  var locationData = JSON.parse(data);
  //var locationData = data;
  movingString.x = locationData.x;
  movingString.y = locationData.y;
  drawCanvas();
});


socket.on('scoreData', function(data) {
  var scoreData = JSON.parse(data);
  score1 = scoreData.score1;
  score2 = scoreData.score2;
// update the score
  drawCanvas();

});
/*  socket.on('pointsdata', function(data) {
    console.log("data: " + data);
    console.log("typeof: " + typeof data);
    //var locationData = JSON.parse(data);
    var locationData = JSON.parse(data);
    //var locationData = data;
    movingString.x = locationData.x;
    movingString.y= locationData.y;
    drawCanvas();
  });*/



$(document).ready(function() {
  //add mouse down listener to our canvas object
  // $("#canvas1").mousedown(handleMouseDown);
  //add keyboard handler to document
  $(document).keydown(handleKeyDown);
  $(document).keyup(handleKeyUp);

  timer = setInterval(handleTimer, 100); //tenth of second
  //pollingTimer = setInterval(pollingTimerHandler, 100); //quarter of a second
  //timer.clearInterval(); //to stop

  drawCanvas();
});
