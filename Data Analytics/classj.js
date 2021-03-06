// SDK Needs to create video and canvas nodes in the DOM in order to function
// Here we are adding those nodes a predefined div.
var divRoot = $("#affdex_elements")[0];
var width = 640;
var height = 480;
var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
//Construct a CameraDetector and specify the image width / height and face detector mode.
var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

//Enable detection of all Expressions, Emotions and Emojis classifiers.
detector.detectAllEmotions();
detector.detectAllExpressions();
detector.detectAllEmojis();
detector.detectAllAppearance();


//Add a callback to notify when the detector is initialized and ready for runing.
detector.addEventListener("onInitializeSuccess", function() {
  log('#logs', "The detector reports initialized");
  //Display canvas instead of video feed because we want to draw the feature points on it
  $("#face_video_canvas").css("display", "block");
  $("#face_video").css("display", "none");
});

function log(node_name, msg) {
  $(node_name).append("<span>" + msg + "</span><br />")
}

var xV = document.getElementById("final_note");

//function executes when Start button is pushed.
function onStart() {
  if (detector && !detector.isRunning) {
    $("#logs").html("");
    detector.start();
  }
  log('#logs', "Clicked the start button");

  //Letting the final note display at the end only
  xV.style.display = "none";
}

//function executes when the Reset button is pushed.
function onReset() {
  log('#logs', "Clicked the reset button");
  if (detector && detector.isRunning) {
    detector.reset();

    $('#results').html("");
  }
};

//Add a callback to notify when camera access is allowed
detector.addEventListener("onWebcamConnectSuccess", function() {
  log('#logs', "Webcam access allowed");
});

//Add a callback to notify when camera access is denied
detector.addEventListener("onWebcamConnectFailure", function() {
  log('#logs', "webcam denied");
  console.log("Webcam access denied");
});

//Add a callback to notify when detector is stopped
detector.addEventListener("onStopSuccess", function() {
  log('#logs', "The detector reports stopped");
  $("#results").html("");
});


// // let csvContent = "data:text/csv;charset=utf-8,";
var joye = [];
var sade = [];
var feare = [];
var surpe = [];
var valene = [];
var attene = [];
var browe = [];
var framenum = [];
var ind = 0;

// Current consecutive fear/sadness levels
var fearF = 0;
var sadF = 0;


//Lower Attention
var low_att = 0;
//Hugely distracted-not looking
var distra = 0;

//Misunderstanding
var brow = 0;
var browR = 0;
//Sleeping
var eyeC = 0;

//Add a callback to receive the results from processing an image.
//The faces object contains the list of the faces detected in an image.
//Faces object contains probabilities for all the different expressions, emotions and appearance metrics
detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
  $('#results').html("");
  $('#drlogs').html("");
  log('#results', "Timestamp: " + timestamp.toFixed(2));
  log('#results', "Number of faces found: " + faces.length);

  if (faces.length > 0) {
    log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));
    log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function(key, val) {
      return val.toFixed ? Number(val.toFixed(0)) : val;
    }));

    var xSm = document.getElementById("ressm");
    var xSad = document.getElementById("ressad");

    if (faces[0].emotions['valence'] >= 0) {
      xSm.style.display = "block";
      xSad.style.display = "none";
    } else {
      xSm.style.display = "none";
      xSad.style.display = "block";
    }

    ind += 1;

    //keeping track of patient's fear status
    if (faces[0].emotions['fear'].toFixed(0) > 10) {
      fearF +=1;
    }
    if (faces[0].emotions['fear'].toFixed(0) <= 10) {
      fearF = 0;
    }

    //keeping track of patient's eye clouse
    if (faces[0].expressions['eyeClosure'].toFixed(0) >= 50) {
      eyeC +=1;
    } else {
      eyeC = 0;
    }

    //if patient has been sleeping for over 3 seconds display that!
    if (eyeC >= 30) {
      alert("The student is sleeping!!!!");
    }

    //keeping track of patient's brow furrow
    if (faces[0].expressions['browFurrow'].toFixed(0) > 0) {
      brow +=1;
    } else {
      brow = 0;
    }

    //if patient has been sleeping for over 3 seconds display that!
    if (brow >= 30) {
      log('#drlogs', "The student may be struggling to understand this part\n Please make sure to re-iterate this part");
    }


    //keeping track of patient's brow Raise
    if (faces[0].expressions['browRaise'].toFixed(0) > 0) {
      browR +=1;
    } else {
      browR = 0;
    }

    //if patient has been sleeping for over 3 seconds display that!
    if (browR >= 30) {
      log('#drlogs', "The student may be struggling to understand this part\n Please make sure to re-iterate this part");
    }

    //keeping track of student Attention
    if ( (faces[0].expressions['attention'].toFixed(0) <= 90) && (faces[0].expressions['attention'].toFixed(0) > 60) ) {
      low_att += 1;
    }
    if ( faces[0].expressions['attention'].toFixed(0) <= 60 ) {
      distra += 1;
    }

    //adding frame values to their respective arrays
    browe.push(faces[0].expressions['browFurrow'].toFixed(0));
    attene.push(faces[0].expressions['attention'].toFixed(0));
    framenum.push(ind);
    valene.push(faces[0].emotions['valence'].toFixed(0));
    joye.push(faces[0].emotions['joy'].toFixed(0));
    sade.push(faces[0].emotions['sadness'].toFixed(0));
    feare.push(faces[0].emotions['fear'].toFixed(0));
    surpe.push(faces[0].emotions['surprise'].toFixed(0));

    log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, function(key, val) {
      return val.toFixed ? Number(val.toFixed(0)) : val;
    }));
    //log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);
    /*if($('#face_video_canvas')[0] != null)
      drawFeaturePoints(image, faces[0].featurePoints);
      */
  }
});

//function executes when the Stop button is pushed.
function onStop() {
  log('#logs', "Clicked the stop button");
  if (detector && detector.isRunning) {
    detector.removeEventListener();
    detector.stop();
  }

  var n = valene.length;
  var nI = Math.round( n/10 );
  var valEnd = 0;
  //alert(nI);
  for (var i = n - nI-1; i < n; ++i) {
    if (valene[i]>=0) {
      valEnd +=1;
    }
  }
  //alert(valEnd);
  if (valEnd >= (nI*0.7)) {
    xV.style.display = "block";
  }


  var brow_em = {
  x: framenum,
  y: browe,
  name: 'BrowFurrow',
  type: 'lines'
  };

  var atten_em = {
  x: framenum,
  y: attene,
  name: 'Attention',
  type: 'lines'
  };

  var joy_em = {
  x: framenum,
  y: joye,
  name: 'Joy',
  type: 'lines'
  };

  var sadness_em = {
  x: framenum,
  y: sade,
  name: 'Sadness',
  type: 'lines'
  };

  var surprise_em = {
  x: framenum,
  y: surpe,
  name: 'Surprise',
  type: 'lines'
  };

  var fear_em = {
  x: framenum,
  y: feare,
  name: 'Fear',
  type: 'lines'
  };

  var data4 = [brow_em, atten_em, surprise_em];

  var layout = {
    title: 'Emotions displayed through out the session',
    xaxis: {
      title: 'Frame number'
    },
    yaxis: {
      title: 'Emotion detected',
      showline: false
    }
  };

  Plotly.newPlot('tester', data4, layout);


  //attentive
  var curr_att = ind - low_att - distra;

  var A_data = [{
  values: [low_att, distra, curr_att],
  labels: ['Not fully being attention', 'Completely Distracted', 'Paying attention'],
  type: 'pie'
}];

var A_layout = {
  height: 400,
  width: 500
};

Plotly.newPlot('tester2', A_data, A_layout);


  //re-setting all arrays
  joye = [];
  sade = [];
  feare = [];
  surpe = [];
  valene = [];
  attene = [];
  low_att = 0;
  distra = 0;
//  framenum = [];


};

//Draw the detected facial feature points on the image
function drawFeaturePoints(img, featurePoints) {
  var contxt = $('#face_video_canvas')[0].getContext('2d');

  var hRatio = contxt.canvas.width / img.width;
  var vRatio = contxt.canvas.height / img.height;
  var ratio = Math.min(hRatio, vRatio);

  contxt.strokeStyle = "#FFFFFF";
  for (var id in featurePoints) {
    contxt.beginPath();
    contxt.arc(featurePoints[id].x,
      featurePoints[id].y, 2, 0, 2 * Math.PI);
    contxt.stroke();

  }
}
