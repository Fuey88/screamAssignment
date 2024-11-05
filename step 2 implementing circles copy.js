let screamImg; // Hidden background image
let skyShape; // Invisible gradient overlay for reference
let circles = []; // Array to store circle positions and unique noise offsets

function preload() {
  // Load both images from the assets folder
  screamImg = loadImage("assets/scream.jpg"); // Load but don't display
  skyShape = loadImage("assets/skyGradient.png"); // Load skyShape for reference only
}

function setup() {
  screamImg.loadPixels();
  createCanvas(screamImg.width, screamImg.height); // Set canvas to the dimensions of screamImg
  skyShape.resize(width, height); // Resize skyShape to match the canvas size, if needed

  // Initialize circles with positions and properties
  for (let i = 0; i < 3000; i++) {
    let xPos = width + random(width); // Start off the right edge with random x offset
    let yPos = findRandomNonTransparentY() + random(-5, 5); // Random y position within or slightly below non-transparent area
    let initialColor = color(0); // Start with a placeholder color

    circles.push({
      x: xPos,
      y: yPos,
      size: random(5, 10), // Random circle size between 5 and 10
      noiseOffset: random(1000), // Unique noise offset for subtle movement
      currentColor: initialColor, // Current displayed color
      targetColor: initialColor // Target color for smooth transition
    });
  }
  
  clear(); // Clear the canvas, no need to draw skyShape
}

function draw() {
  background(0); // Black background for contrast

  for (let i = 0; i < circles.length; i++) {
    let circle = circles[i];

    // Apply almost imperceptible Perlin noise to each circle's vertical position
    let yNoise = noise(circle.x * 0.01, circle.noiseOffset) * 0.2 - 0.1;
    circle.y += yNoise;

    // Move circle from right to left
    circle.x -= 1;

    // Check if circle is in a non-transparent area of skyShape
    let pixelAlpha = skyShape.get(int(circle.x), int(circle.y))[3]; // Get alpha channel of the pixel
    if (pixelAlpha > 0) {
      // Get the target color from screamImg and update circle’s targetColor
      let px = int(circle.x);
      let py = int(circle.y);
      let newTargetColor = screamImg.get(px, py);
      circle.targetColor = color(newTargetColor);

      // Interpolate between currentColor and targetColor for a smooth transition
      circle.currentColor = lerpColor(circle.currentColor, circle.targetColor, 0.1); // Adjust 0.1 for smoother transition speed

      // Draw the circle with the smoothly transitioning color
      fill(circle.currentColor);
      noStroke();
      ellipse(circle.x, circle.y, circle.size, circle.size);
    }

    // Wrap circle back to the right when it moves off the left edge
    if (circle.x < 0) {
      circle.x = width;
      circle.y = findRandomNonTransparentY() + random(-5, 5);
      circle.noiseOffset = random(1000); // Reset noise offset for a fresh trajectory
    }
  }
}

// Helper function to find a random non-transparent y position
function findRandomNonTransparentY() {
  let y;
  do {
    y = int(random(height)); // Random y position within the canvas height
  } while (skyShape.get(int(random(width)), y)[3] < 255); // Repeat if y position is in transparent area
  return y;
}
