let screamImg; // Hidden background image
let skyShape, waterShape, greenShape, boardwalkShape, screamerShape; // Color map overlays
let skyCircles = [], waterCircles = [], greenCircles = [], boardwalkCircles = [], screamerCircles = []; // Arrays to store circles for each shape
let imgAspectRatio; // Aspect ratio for resizing
let skyColor, waterColor, greenColor, boardwalkColor, screamerColor; // Define colors for each shape
let frameCounter = 0; // Frame counter for interpolation frequency

function preload() {
  // Load images from the assets folder
  screamImg = loadImage("assets/scream.jpg"); // Load but don't display
  skyShape = loadImage("assets/skyColourMap.png"); // Sky color map
  waterShape = loadImage("assets/waterColourMap.png"); // Water color map
  greenShape = loadImage("assets/greenColourMap.png"); // Green color map
  boardwalkShape = loadImage("assets/boardwalkColourMap.png"); // Boardwalk color map
  screamerShape = loadImage("assets/screamerColourMap.png"); // Screamer color map
}

function setup() {
  frameRate(30); // Set frame rate to 30 to reduce computational load
  imgAspectRatio = screamImg.width / screamImg.height; // Calculate image aspect ratio
  resizeCanvasToFitWindow(); // Initial resize based on window height
  screamImg.loadPixels();
  skyShape.loadPixels();
  waterShape.loadPixels();
  greenShape.loadPixels();
  boardwalkShape.loadPixels();
  screamerShape.loadPixels();

  // Define target colors
  skyColor = color(255, 116, 2); // skyColor is #ff7402
  waterColor = color(2, 2, 255); // waterColor is #0202ff
  greenColor = color(30, 255, 0); // greenColor is #1eff00
  boardwalkColor = color(153, 43, 0); // boardwalkColor is #992b00
  screamerColor = color(255, 91, 250); // screamerColor is #ff5bfa

  // Initialize circles for each shape with customizable sizes
  initializeCircles(skyCircles, skyShape, skyColor, 2000, 0.2, 0, 20); // Sky circles with size 10
  initializeCircles(waterCircles, waterShape, waterColor, 2000, 0.3, -0.15, 14); // Water circles with size 15
  initializeCircles(greenCircles, greenShape, greenColor, 2000, 0.15, -0.25, 12); // Green circles with size 20
  initializeCircles(boardwalkCircles, boardwalkShape, boardwalkColor, 7000, -0.2, -0.4, 10); // Boardwalk circles with size 12
  initializeCircles(screamerCircles, screamerShape, screamerColor, 9000, 0, -0.1, 4); // Screamer circles with size 18
}

function draw() {
  background(0); // Black background for contrast
  frameCounter++; // Increment frame counter

  // Move and draw circles for each shape
  moveAndDrawCircles(skyCircles, skyShape, skyColor);
  moveAndDrawCircles(waterCircles, waterShape, waterColor);
  moveAndDrawCircles(greenCircles, greenShape, greenColor);
  moveAndDrawCircles(boardwalkCircles, boardwalkShape, boardwalkColor);
  moveAndDrawCircles(screamerCircles, screamerShape, screamerColor); // Screamer circles moving vertically
}

// Function to initialize circles with customizable size
function initializeCircles(circles, shape, color, count, xSpeed, ySpeed, size) {
  for (let i = 0; i < count; i++) {
    let { x: xPos, y: yPos } = findRandomColorPosition(shape, color);
    let initialColor = getCachedColor(screamImg, int(xPos), int(yPos));

    circles.push({
      x: xPos,
      y: yPos,
      size: size + random(5), // Use specified size with slight random variation
      opacity: 0, // Start transparent
      fadeIn: true,
      delay: int(random(30, 150)), // Random delay to start fading in
      opacityDecayRate: random(1, 3), // Random fade-out rate
      currentColor: initialColor,
      targetColor: initialColor,
      xSpeed: xSpeed,
      ySpeed: ySpeed
    });
  }
}

// Function to move, fade, and draw circles based on shape
function moveAndDrawCircles(circles, shape, shapeColor) {
  for (let i = 0; i < circles.length; i++) {
    let circle = circles[i];

    // Only start moving and fading in after delay has passed
    if (frameCounter >= circle.delay) {
      // Move circle based on specified direction
      circle.x += circle.xSpeed;
      circle.y += circle.ySpeed;

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
        circle.opacity -= circle.opacityDecayRate; // Slowly fade out with variable rate
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
  screamerShape.resize(newWidth, newHeight);
  screamImg.loadPixels();
  skyShape.loadPixels();
  waterShape.loadPixels();
  greenShape.loadPixels();
  boardwalkShape.loadPixels();
  screamerShape.loadPixels();
}

function windowResized() {
  resizeCanvasToFitWindow();
}
