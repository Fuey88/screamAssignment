let screamImg; // hidden background image
let skyShape, waterShape, greenShape, boardwalkShape; // colour map overlays
let skyCircles = [], waterCircles = [], greenCircles = [], boardwalkCircles = []; // arrays to store circles for each shape
let imgAspectRatio; // aspect ratio for resizing
let skyColour, waterColour, greenColour, boardwalkColour; // define colours for each shape
let frameCounter = 0; // frame counter for interpolation frequency

function preload() {
  // loads images from assets folder
  screamImg = loadImage("assets/scream.jpg"); // loads but doesn't display
  skyShape = loadImage("assets/skyColourMap.png"); // sky colour map
  waterShape = loadImage("assets/waterColourMap.png"); // water colour map
  greenShape = loadImage("assets/greenColourMap.png"); // foliage colour map
  boardwalkShape = loadImage("assets/boardwalkColourMap.png"); // boardwalk colour map
}

function setup() {
  frameRate(30); // sets frame rate lower to reduce computational load
  imgAspectRatio = screamImg.width / screamImg.height; // calculates image aspect ratio
  resizeCanvasToFitWindow(); // initial resize based on window height
  screamImg.loadPixels(); // loads pixel data for scream image
  skyShape.loadPixels(); 
  waterShape.loadPixels();
  greenShape.loadPixels(); 
  boardwalkShape.loadPixels(); 

  // define target colours for circles to check shape pos
  skyColour = color(255, 116, 2); // sky colour
  waterColour = color(2, 2, 255); // water colour
  greenColour = color(30, 255, 0); // green colour
  boardwalkColour = color(153, 43, 0); // boardwalk colour

  // initialise circles for each shape with speeds on x and y axis and customisable sizes
  initializeCircles(skyCircles, skyShape, skyColour, 4000, 0.3, 0, 16); // sky circles
  initializeCircles(waterCircles, waterShape, waterColour, 3000, 0.3, -0.15, 14); // water circles
  initializeCircles(greenCircles, greenShape, greenColour, 2000, 0.15, -0.25, 12); // green circles
  initializeCircles(boardwalkCircles, boardwalkShape, boardwalkColour, 7000, -0.3, -0.3, 10); // boardwalk circles
}

function draw() {
  background(0); // black background for contrast
  frameCounter++; // increment frame counter - used for changing colours

  // move and draw circles for each shape
  moveAndDrawCircles(skyCircles, skyShape, skyColour);
  moveAndDrawCircles(waterCircles, waterShape, waterColour);
  moveAndDrawCircles(greenCircles, greenShape, greenColour);
  moveAndDrawCircles(boardwalkCircles, boardwalkShape, boardwalkColour);

  // draw the screamer character
  drawScreamer();
}

// initialises circles with customisable size and speed
function initializeCircles(circles, shape, colour, count, xSpeed, ySpeed, size) {
  for (let i = 0; i < count; i++) {
    let { x: xPos, y: yPos } = findRandomColourPosition(shape, colour); // find random position in shape
    let initialColour = getCachedColour(screamImg, int(xPos), int(yPos)); // get initial colour

    circles.push({
      x: xPos, // xposition
      y: yPos, // yposition
      size: size + random(5), // size with slight random variation
      opacity: 0, // start transparent
      fadeIn: true, // flag for fade in
      delay: int(random(30, 300)), // more random delay before starting to avoid synchronisation
      opacityDecayRate: random(0.5, 1.5), // random fadeout rate (slowed down)
      currentColour: initialColour, // current colour
      targetColour: initialColour, // target colour
      xSpeed: xSpeed, // horizontal speed
      ySpeed: ySpeed // vertical speed
    });
  }
}

// moves, fades, and draws circles based on shape
function moveAndDrawCircles(circles, shape, shapeColour) {
  let buffer = 16; // allow circles to move slightly beyond the screen edges before resetting

  for (let i = 0; i < circles.length; i++) {
    let circle = circles[i];

    // start moving and fading in after delay
    if (frameCounter >= circle.delay) {
      circle.x += circle.xSpeed; // update x position
      circle.y += circle.ySpeed; // update y position

      // update colour every few frames
      if (frameCounter % 5 === 0) {
        let newTargetColour = getCachedColour(screamImg, int(circle.x), int(circle.y));
        circle.targetColour = newTargetColour; // set new target colour
      }

      // interpolate between current and target colour
      circle.currentColour = lerpColor(circle.currentColour, circle.targetColour, 0.1);

      // handle fade in and fade out
      if (circle.fadeIn) {
        circle.opacity += 12.5; // increase opacity more slowly (was 25)
        if (circle.opacity >= 255) {
          circle.opacity = 255;
          circle.fadeIn = false; // switch to fading out
        }
      } else {
        circle.opacity -= circle.opacityDecayRate; // fade out more slowly
        if (circle.opacity <= 0) {
          // reset circle when fully faded out
          let newPosition = findRandomColourPosition(shape, shapeColour);
          circle.x = newPosition.x; // reset x position
          circle.y = newPosition.y; // reset y position
          circle.opacity = 0; // reset opacity
          circle.fadeIn = true; // start fading in again
          circle.delay = frameCounter + int(random(30, 300)); // set new delay with greater randomness
          circle.currentColour = getCachedColour(screamImg, int(circle.x), int(circle.y));
          circle.targetColour = circle.currentColour; // reset colours
        }
      }

      // apply scale factor to circle size
      let scaleFactor = height / 812;
      fill(red(circle.currentColour), green(circle.currentColour), blue(circle.currentColour), circle.opacity);
      noStroke();
      ellipse(circle.x, circle.y, circle.size * scaleFactor, circle.size * scaleFactor);
    }

    // reset if circle moves off screen, with a 20px buffer
    if (circle.x < -buffer || circle.x > width + buffer || circle.y < -buffer || circle.y > height + buffer) {
      let newPosition = findRandomColourPosition(shape, shapeColour);
      circle.x = newPosition.x; // reset x position
      circle.y = newPosition.y; // reset y position
      circle.opacity = 0; // reset opacity
      circle.fadeIn = true; // start fading in again
      circle.delay = frameCounter + int(random(30, 300)); // set new delay with greater randomness
    }
  }
}

// gets colour from cached pixel data
function getCachedColour(image, x, y) {
  let index = (x + y * image.width) * 4; // calculate index in pixels array
  return color(image.pixels[index], image.pixels[index + 1], image.pixels[index + 2]); // return colour
}

// finds a random position within the specified colour area
function findRandomColourPosition(shape, colour) {
  let x, y;
  let attempts = 0;
  const maxAttempts = 1000;

  do {
    x = int(random(width)); // random x within canvas
    y = int(random(height)); // random y within canvas
    attempts++;
    if (attempts >= maxAttempts) {
      console.error("max attempts reached: unable to find matching colour");
      break;
    }
  } while (!isShapeColour(getCachedColour(shape, x, y), colour));
  return { x, y }; // return position
}

// checks if a pixel colour matches the specified shape colour
function isShapeColour(pixelColour, shapeColour) {
  return red(pixelColour) === red(shapeColour) &&
         green(pixelColour) === green(shapeColour) &&
         blue(pixelColour) === blue(shapeColour);
}

// resizes canvas based on window height while maintaining aspect ratio
function resizeCanvasToFitWindow() {
  let newHeight = windowHeight; // new height based on window
  let newWidth = newHeight * imgAspectRatio; // calculate new width

  resizeCanvas(newWidth, newHeight); // resize canvas
  screamImg.resize(newWidth, newHeight); // resize image
  skyShape.resize(newWidth, newHeight); 
  waterShape.resize(newWidth, newHeight); 
  greenShape.resize(newWidth, newHeight); 
  boardwalkShape.resize(newWidth, newHeight);
  screamImg.loadPixels(); // reload pixels
  skyShape.loadPixels();
  waterShape.loadPixels(); 
  greenShape.loadPixels(); 
  boardwalkShape.loadPixels(); 
}

function windowResized() {
  resizeCanvasToFitWindow(); // adjust canvas on window resize
}

function drawScreamer() {
  noStroke(); // ensures no outlines are drawn around shapes

  // the screamer was originally made without accounting for window resize,
  // the scale factor was created based on the windows height in comparison
  // to the height of the original proportions of the screamer at the optimal height
  // with scaleFactor being added to each element ensuring correct sizing for current window height
  let scaleFactor = height / 812;

  // Draw bodies main shape with curves
  fill(76, 63, 55); // body color
  beginShape();
  curveVertex(width / 3, height); // start from bottom left of the screen
  curveVertex(202 * scaleFactor, 752 * scaleFactor); // curve down towards body base
  curveVertex(206 * scaleFactor, 692 * scaleFactor); // upward curve to define waist
  curveVertex(188 * scaleFactor, 651 * scaleFactor); // curve inwards for shape contour
  curveVertex(209 * scaleFactor, 593 * scaleFactor); // define shoulder area
  curveVertex(222 * scaleFactor, 533 * scaleFactor); // further shape upper body
  curveVertex(271 * scaleFactor, 509 * scaleFactor); // neck and head start
  curveVertex(249 * scaleFactor, 434 * scaleFactor); // further curve for neck
  curveVertex(300 * scaleFactor, 387 * scaleFactor); // head curve start
  curveVertex(365 * scaleFactor, 427 * scaleFactor); // complete head shape
  curveVertex(345 * scaleFactor, 520 * scaleFactor); // outline back to body
  curveVertex(374 * scaleFactor, 610 * scaleFactor); // lower body
  curveVertex(305 * scaleFactor, 738 * scaleFactor); // return to lower body area
  curveVertex(320 * scaleFactor, height); // complete body outline at bottom right
  endShape(CLOSE);

  // draw his hand - positioned near upper part of the body
  fill(211, 164, 103); // hand color
  beginShape();
  curveVertex(246 * scaleFactor, 567 * scaleFactor); // hand start
  curveVertex(271 * scaleFactor, 509 * scaleFactor); // move to lower hand section
  curveVertex(249 * scaleFactor, 434 * scaleFactor); // curve up to hand contour
  curveVertex(300 * scaleFactor, 387 * scaleFactor); // hand wrist area
  curveVertex(365 * scaleFactor, 427 * scaleFactor); // base of fingers
  curveVertex(345 * scaleFactor, 520 * scaleFactor); // up along fingers
  curveVertex(374 * scaleFactor, 610 * scaleFactor); // back down along hand
  curveVertex(353 * scaleFactor, 617 * scaleFactor); // close off hand shape
  curveVertex(318 * scaleFactor, 542 * scaleFactor); // hand thumb area
  curveVertex(340 * scaleFactor, 450 * scaleFactor); // fingers continue
  curveVertex(285 * scaleFactor, 457 * scaleFactor); // top of hand contour
  curveVertex(296 * scaleFactor, 505 * scaleFactor); // lower back of hand
  curveVertex(263 * scaleFactor, 587 * scaleFactor); // base of hand near wrist
  endShape(CLOSE);

  // draw face: contour of the face structure
  fill(163, 144, 105); // face color
  beginShape();
  curveVertex(295 * scaleFactor, 514 * scaleFactor); // face outline start
  curveVertex(284 * scaleFactor, 484 * scaleFactor); // top of face
  curveVertex(263 * scaleFactor, 447 * scaleFactor); // curve down left side of face
  curveVertex(293 * scaleFactor, 389 * scaleFactor); // lower chin area
  curveVertex(351 * scaleFactor, 422 * scaleFactor); // right side of face
  curveVertex(342 * scaleFactor, 469 * scaleFactor); // return to top right of face
  curveVertex(329 * scaleFactor, 492 * scaleFactor); // finish contour
  curveVertex(313 * scaleFactor, 513 * scaleFactor); // end at chin
  endShape(CLOSE);

  //  eyes and mouth to define facial expression
  fill(216, 181, 117); // color for expression details
  ellipse(290 * scaleFactor, 440 * scaleFactor, 20 * scaleFactor, 30 * scaleFactor); // left eye
  ellipse(325 * scaleFactor, 440 * scaleFactor, 20 * scaleFactor, 30 * scaleFactor); // right eye
  ellipse(308 * scaleFactor, 490 * scaleFactor, 15 * scaleFactor, 30 * scaleFactor); // mouth
}
 