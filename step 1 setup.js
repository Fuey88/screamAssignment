let screamImg; // Hidden background image
let skyGradient; // Visible gradient overlay for the sky

function preload() {
  // Load both images from the assets folder
  screamImg = loadImage("assets/scream.jpg"); // Load but don't display
  skyGradient = loadImage("assets/skyGradient.png"); // Visible gradient overlay
}

function setup() {
  // Wait until screamImg is loaded to access its width and height
  screamImg.loadPixels();
  createCanvas(screamImg.width, screamImg.height); // Set canvas to the dimensions of screamImg
  
  // Resize skyGradient to match the canvas size, if needed
  skyGradient.resize(width, height);
  
  // Draw scream image to load its pixel data, but keep it hidden
  image(screamImg, 0, 0);
  loadPixels(); // Load pixel data from scream image
  
  // Clear the canvas and draw only the sky gradient
  clear(); // Clears the scream image from the canvas
  image(skyGradient, 0, 0); // Display only the sky gradient
}

function draw() {
  // Only display the skyGradient without drawing any other elements
  background(0); // Black background for contrast
  image(skyGradient, 0, 0, width, height); // Display the gradient overlay
}
