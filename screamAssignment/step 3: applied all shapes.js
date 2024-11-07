let screamImg; // Hidden background image
let skyShape, waterShape, greenShape, boardwalkShape; // Color map overlays
let skyCircles = [], waterCircles = [], greenCircles = [], boardwalkCircles = []; // Arrays to store circles for each shape
let imgAspectRatio; // Aspect ratio for resizing
let skyColor, waterColor, greenColor, boardwalkColor; // Define colors for each shape
let frameCounter = 0; // Frame counter for interpolation frequency

function preload() {
  // Load images from the assets folder
  screamImg = loadImage("assets/scream.jpg"); // Load but don't display
  skyShape = loadImage("assets/skyColourMap.png"); // Sky color map
  waterShape = loadImage("assets/waterColourMap.png"); // Water color map
  greenShape = loadImage("assets/greenColourMap.png"); // Green color map
  boardwalkShape = loadImage("assets/boardwalkColourMap.png"); // Boardwalk color map
  screamerImg = loadImage("assets/screamer.png"); // Load overlay image
}

function setup() {
  frameRate(30);
  imgAspectRatio = screamImg.width / screamImg.height; // Calculate the image aspect ratio
  resizeCanvasToFitWindow(); // Initial resize based on window height
  screamImg.loadPixels();
  skyShape.loadPixels();
  waterShape.loadPixels();
  greenShape.loadPixels();
  boardwalkShape.loadPixels();

  // Define target colors
  skyColor = color(255, 116, 2); // skyColor is #ff7402
  waterColor = color(2, 2, 255); // waterColor is #0202ff
  greenColor = color(30, 255, 0); // greenColor is #1eff00
  boardwalkColor = color(153, 43, 0); // boardwalkColor is #992b00

  // Initialize circles for sky shape
  for (let i = 0; i < 6000; i++) {
    let { x: xPos, y: yPos } = findRandomColorPosition(skyShape, skyColor);
    let initialColor = getCachedColor(screamImg, int(xPos), int(yPos));

    skyCircles.push({
      x: xPos,
      y: yPos,
      size: 10,
      opacity: 0, // Start transparent
      fadeIn: true,
      delay: int(random(30, 150)),
      currentColor: initialColor,
      targetColor: initialColor
    });
  }

  // Initialize circles for water shape
  for (let i = 0; i < 6000; i++) {
    let { x: xPos, y: yPos } = findRandomColorPosition(waterShape, waterColor);
    let initialColor = getCachedColor(screamImg, int(xPos), int(yPos));

    waterCircles.push({
      x: xPos,
      y: yPos,
      size: 10,
      opacity: 0,
      fadeIn: true,
      delay: int(random(30, 150)),
      currentColor: initialColor,
      targetColor: initialColor
    });
  }

  // Initialize circles for green shape
  for (let i = 0; i < 6000; i++) {
    let { x: xPos, y: yPos } = findRandomColorPosition(greenShape, greenColor);
    let initialColor = getCachedColor(screamImg, int(xPos), int(yPos));

    greenCircles.push({
      x: xPos,
      y: yPos,
      size: 10,
      opacity: 0,
      fadeIn: true,
      delay: int(random(30, 150)),
      currentColor: initialColor,
      targetColor: initialColor
    });
  }

  // Initialize circles for boardwalk shape
  for (let i = 0; i < 6000; i++) {
    let { x: xPos, y: yPos } = findRandomColorPosition(boardwalkShape, boardwalkColor);
    let initialColor = getCachedColor(screamImg, int(xPos), int(yPos));

    boardwalkCircles.push({
      x: xPos,
      y: yPos,
      size: 10,
      opacity: 0,
      fadeIn: true,
      delay: int(random(30, 150)),
      currentColor: initialColor,
      targetColor: initialColor
    });
  }

  clear(); // Clear the canvas
}

function draw() {
  background(0); // Black background for contrast
  frameCounter++; // Increment frame counter

  // Draw and move sky circles (horizontal movement)
  moveAndDrawCircles(skyCircles, skyShape, skyColor, 1, 0);

  // Draw and move water circles (diagonal movement)
  moveAndDrawCircles(waterCircles, waterShape, waterColor, 0.7, -0.3);

  // Draw and move green circles (vertical movement)
  moveAndDrawCircles(greenCircles, greenShape, greenColor, 0.5, -0.5);

  // Draw and move boardwalk circles (diagonal movement with unique speed)
  moveAndDrawCircles(boardwalkCircles, boardwalkShape, boardwalkColor, -0.5, -0.8);
}

// Function to move, fade, and draw circles based on shape and movement direction
function moveAndDrawCircles(circles, shape, shapeColor, xSpeed, ySpeed) {
  for (let i = 0; i < circles.length; i++) {
    let circle = circles[i];

    // Only start moving and fading in after delay has passed
    if (frameCounter >= circle.delay) {
      // Move circle based on specified direction
      circle.x += xSpeed;
      circle.y += ySpeed;

      // Update color every 5 frames only
      if (frameCounter % 5 === 0) {
        let newTargetColor = getCachedColor(screamImg, int(circle.x), int(circle.y));
        circle.targetColor = newTargetColor;
      }

      // Interpolate between currentColor and targetColor for a smooth transition
      circle.currentColor = lerpColor(circle.currentColor, circle.targetColor, 0.1);

      // Handle quick fade in and slow fade out
      if (circle.fadeIn) {
        circle.opacity += 25; // Increase opacity quickly
        if (circle.opacity >= 255) {
          circle.opacity = 255;
          circle.fadeIn = false; // Switch to fading out
        }
      } else {
        circle.opacity -= 2; // Slowly fade out
        if (circle.opacity <= 0) {
          // Reset circle once fully faded out
          let newPosition = findRandomColorPosition(shape, shapeColor);
          circle.x = newPosition.x;
          circle.y = newPosition.y;
          circle.opacity = 0; // Reset to transparent
          circle.fadeIn = true; // Start fading in again
          circle.delay = frameCounter + int(random(30, 150)); // Set a new delay
          circle.currentColor = getCachedColor(screamImg, int(circle.x), int(circle.y));
          circle.targetColor = circle.currentColor;
        }
      }

      // Draw the circle with the smoothly transitioning color and opacity
      fill(red(circle.currentColor), green(circle.currentColor), blue(circle.currentColor), circle.opacity);
      noStroke();
      ellipse(circle.x, circle.y, circle.size, circle.size);
    }

    // Reset if circle moves off screen
    if (circle.x < 0 || circle.x > width || circle.y < 0 || circle.y > height) {
      let newPosition = findRandomColorPosition(shape, shapeColor);
      circle.x = newPosition.x;
      circle.y = newPosition.y;
      circle.opacity = 0; // Reset opacity
      circle.fadeIn = true; // Start fading in again
      circle.delay = frameCounter + int(random(30, 150)); // Set a new delay
    }
  }

  // Draw the screamer image in front of all circles
  image(screamerImg, 0, 0, width, height);
}

// Helper function to get color from cached pixel data
function getCachedColor(image, x, y) {
  let index = (x + y * image.width) * 4; // Calculate index in pixels array
  return color(image.pixels[index], image.pixels[index + 1], image.pixels[index + 2]);
}

// Helper function to find a random position within the specified color area
function findRandomColorPosition(shape, color) {
  let x, y;
  let attempts = 0;
  const maxAttempts = 1000;

  do {
    x = int(random(width)); // Random x position within the canvas width
    y = int(random(height)); // Random y position within the canvas height
    attempts++;
    if (attempts >= maxAttempts) {
      console.error("Max attempts reached: Unable to find matching color.");
      break;
    }
  } while (!isShapeColor(getCachedColor(shape, x, y), color));
  return { x, y };
}

// Check if a pixel color matches the specified shape color
function isShapeColor(pixelColor, shapeColor) {
  return red(pixelColor) === red(shapeColor) &&
         green(pixelColor) === green(shapeColor) &&
         blue(pixelColor) === blue(shapeColor);
}

// Resize canvas based on window height while maintaining aspect ratio
function resizeCanvasToFitWindow() {
  let newHeight = windowHeight;
  let newWidth = newHeight * imgAspectRatio;

  resizeCanvas(newWidth, newHeight);
  screamImg.resize(newWidth, newHeight);
  skyShape.resize(newWidth, newHeight);
  waterShape.resize(newWidth, newHeight);
  greenShape.resize(newWidth, newHeight);
  boardwalkShape.resize(newWidth, newHeight);
  screamImg.loadPixels();
  skyShape.loadPixels();
  waterShape.loadPixels();
  greenShape.loadPixels();
  boardwalkShape.loadPixels();
}

function windowResized() {
  resizeCanvasToFitWindow();
}
