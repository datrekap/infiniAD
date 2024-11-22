let flowers = [];
let numFlowers = 0;
let mic;
let micLevel = 0;
let glowAmount = 0;
let vid;

// Movement detection variables
let video;
let prevFrame;
let motionThreshold = 70;
let imagesToShow = [];
let currentImage;
let showImageTimer = 0;
let totalDisplayTime = 360; // 6 seconds at 60 fps
let canDetectMovement = true;

function preload() {
  // Load video background
  vid = createVideo('terrain.mp4');
  
  // Load multiple images for movement detection
  imagesToShow.push(loadImage('Ads/1.png'));
  imagesToShow.push(loadImage('Ads/2.png'));
  imagesToShow.push(loadImage('Ads/3.png'));
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  colorMode(HSB, 360, 100, 100, 1);
  noStroke();

  // Setup video background

  // Setup video capture for movement detection
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Create a copy of the first frame for comparison
  prevFrame = createImage(width, height);

  // Initialize microphone with error handling
  mic = new p5.AudioIn();
  mic.start();
  
  // Create flowers
  for(let i = 0; i < numFlowers; i++) {
    let angle = (360 / numFlowers) * i;
    let radius = 200;
    let x = width/2 + cos(angle) * radius;
    let y = height/2 + sin(angle) * radius;
    let area = random(0.8, 1.2);
    let hueOffset = random(-60, 60);
    flowers.push(new Flower(x, y, area, hueOffset));
  }
  
  flowers.push(new Flower(width/2, height/2, 1.4, 0));
}

function draw() {
  vid.loop();
  vid.hide();
  // Check for movement when not showing an image
  if (showImageTimer <= 0) {
    // Get microphone level with amplification and smoothing
    let targetLevel = mic.getLevel();
    micLevel = lerp(micLevel, targetLevel * 4, 0.09);
    glowAmount = lerp(glowAmount, micLevel * 300, 0.1);
    
    // Video background
    image(vid, 0, 0, width, height);
    
    // Draw all flowers
    for(let flower of flowers) {
      flower.draw(micLevel, glowAmount);
    }
    
    // Only attempt movement detection if allowed
    if (canDetectMovement) {
      checkForMovement();
    }
  } 
  // Display detection image when timer is active
  else {
    // Video background during image display
    tint(255,100);
    image(vid, 0, 0, width, height);
    noTint(); 
    // Calculate image dimensions (smaller and centered)
    let imgWidth = width * 0.5; // 50% of canvas width
    let imgHeight = height * 0.8; // 50% of canvas height
    let imgX = (width - imgWidth) / 2; // Centered horizontally
    let imgY = (height - imgHeight) / 2; // Centered vertically
    
    // Draw the randomly selected image
    image(currentImage, imgX, imgY, imgWidth, imgHeight);
    
    // Draw timer bar
    drawTimerBar();
    
    // Countdown timer
    showImageTimer--;
    
    // Reset detection after image display
    if (showImageTimer <= 0) {
      // Pause detection for 2 seconds before allowing next detection
      canDetectMovement = false;
      setTimeout(() => {
        canDetectMovement = true;
      }, 3000);
    }
  }
}

function drawTimerBar() {
  // Calculate remaining time percentage
  let remainingTimePercentage = showImageTimer / totalDisplayTime;
  
  // Draw timer bar at the bottom of the canvas
  push();
  noStroke();
  fill(0, 0, 0); // Red color for timer bar
  rect(0, height - 10, width * remainingTimePercentage, 10);
  pop();
}

function checkForMovement() {
  // Load pixels of current and previous frames
  video.loadPixels();
  prevFrame.loadPixels();
  
  let totalMovement = 0;
  
  // Compare pixel differences
  for (let x = 0; x < video.width; x += 10) {
    for (let y = 0; y < video.height; y += 10) {
      const index = (x + y * video.width) * 4;
      
      const r1 = video.pixels[index];
      const g1 = video.pixels[index + 1];
      const b1 = video.pixels[index + 2];
      
      const r2 = prevFrame.pixels[index];
      const g2 = prevFrame.pixels[index + 1];
      const b2 = prevFrame.pixels[index + 2];
      
      // Calculate color difference
      const diff = dist(r1, g1, b1, r2, g2, b2);
      
      totalMovement += diff;
    }
  }
  
  // If significant movement detected
  if (totalMovement > motionThreshold * 1000) {
    // Randomly select an image
    currentImage = random(imagesToShow);
    
    // Start 5-second display of image
    showImageTimer = totalDisplayTime;
  }
  
  // Update previous frame for next comparison
  prevFrame.copy(video, 0, 0, video.width, video.height, 0, 0, video.width, video.height);
  prevFrame.updatePixels();
}

function mousePressed() {
  // Ensure audio context is started
  userStartAudio().then(() => {
    console.log('Audio context started');
  }).catch(e => {
    console.error('Failed to start audio context:', e);
  });
}

// Flower class remains unchanged from the original code
class Flower {
  constructor(x, y, size, hueOffset) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.hueOffset = hueOffset;
    this.numPetals = 12;
    this.numLayers = 4;
    this.rotationOffset = random(360);
  } 
  draw(micLevel, glowAmount) {
    push();
    translate(this.x, this.y);
    scale(this.size);

    this.rotationOffset += 0.1 + micLevel * 2; // Increased rotation response

    // Draw the glow effect
    drawingContext.shadowBlur = 30 + glowAmount * 2; // Increased glow response
    drawingContext.shadowColor = color(
      (300 + this.hueOffset) % 360,
      80,
      60,
      0.5
    );
    //drawingContext.shadowColor = color(300, 10, 70, 0.5);

    // Draw multiple layers of petals
    for (let layer = this.numLayers; layer > 0; layer--) {
      let baseLayerSize = map(layer, 1, this.numLayers, 20, 80);
      let layerSize = baseLayerSize * (1 + micLevel); // Increased size response

      let hue, saturation, brightness;
      if (this.hueOffset < 0) {
        hue = (map(layer, 1, this.numLayers, 347, 325) + this.hueOffset) % 360; // EA8384
        saturation = map(layer, 1, this.numLayers, 90, 60 + micLevel * 40);
        brightness = map(
          layer,
          1,
          this.numLayers,
          95 + glowAmount,
          85 + glowAmount
        );
      } else if (this.hueOffset < 60) {
        hue = (map(layer, 1, this.numLayers, 320, 300) + this.hueOffset) % 360; // CE9BBE
        saturation = map(layer, 1, this.numLayers, 90, 60 + micLevel * 40);
        brightness = map(
          layer,
          1,
          this.numLayers,
          95 + glowAmount,
          85 + glowAmount
        );
      } else if (this.hueOffset < 120) {
        hue = (map(layer, 1, this.numLayers, 320, 300) + this.hueOffset) % 360; // DCACCE
        saturation = map(layer, 1, this.numLayers, 90, 60 + micLevel * 40);
        brightness = map(
          layer,
          1,
          this.numLayers,
          95 + glowAmount,
          85 + glowAmount
        );
      } else if (this.hueOffset < 180) {
        hue = (map(layer, 1, this.numLayers, 40, 20) + this.hueOffset) % 360; // DAC192
        saturation = map(layer, 1, this.numLayers, 90, 60 + micLevel * 40);
        brightness = map(
          layer,
          1,
          this.numLayers,
          95 + glowAmount,
          85 + glowAmount
        );
      } else if (this.hueOffset < 240) {
        hue = (map(layer, 1, this.numLayers, 60, 40) + this.hueOffset) % 360; // C7C33F
        saturation = map(layer, 1, this.numLayers, 90, 60 + micLevel * 40);
        brightness = map(
          layer,
          1,
          this.numLayers,
          95 + glowAmount,
          85 + glowAmount
        );
      } else {
        hue = (map(layer, 1, this.numLayers, 90, 70) + this.hueOffset) % 360; // 817E43
        saturation = map(layer, 1, this.numLayers, 90, 60 + micLevel * 40);
        brightness = map(
          layer,
          1,
          this.numLayers,
          95 + glowAmount,
          85 + glowAmount
        );
      }

      push();
      rotate(this.rotationOffset * (layer / 2));

      for (let i = 0; i < this.numPetals; i++) {
        let angle = (360 / this.numPetals) * i;
        let petalSize =
          layerSize * (1 + 0.2 * sin(frameCount * 2 + layer * 30) + micLevel);

        push();
        rotate(angle);
        fill(hue, saturation, brightness);

        beginShape();
        for (let t = 0; t <= 1; t += 0.01) {
          let pulseEffect =
            1 + micLevel * sin(frameCount * 4 + layer * 30) * 0.5;
          let px = petalSize * pow(sin(t * 180), 0.5) * pulseEffect;
          let py =
            petalSize *
            (0.5 * sin(t * 180) + 0.5 * sin(t * 180 * 2)) *
            pulseEffect;
          vertex(px, py);
        }
        for (let t = 1; t >= 0; t -= 0.01) {
          let pulseEffect =
            1 + micLevel * sin(frameCount * 4 + layer * 30) * 0.5;
          let px = -petalSize * pow(sin(t * 180), 0.5) * pulseEffect;
          let py =
            petalSize *
            (0.5 * sin(t * 180) + 0.5 * sin(t * 180 * 2)) *
            pulseEffect;
          vertex(px, py);
        }
        endShape(CLOSE);
        pop();
      }
      pop();
    }

    // Draw center
    drawingContext.shadowBlur = 20 + glowAmount;
    drawingContext.shadowColor = color(45 + this.hueOffset / 4, 80, 100, 0.6);

    for (let i = 5; i > 0; i--) {
      let size = map(i, 1, 5, 4, 16) * (1 + micLevel * 0.5);
      let brightness = map(i, 1, 5, 60, 90 + glowAmount);
      fill(45 + this.hueOffset / 4, 80, brightness);
      circle(0, 0, size);
    }

    // Pollen details
    for (let i = 0; i < 12; i++) {
      let angle = random(360);
      let radius = random(6);
      let x = cos(angle) * radius;
      let y = sin(angle) * radius;
      fill(45 + this.hueOffset / 4, 60, 100);
      circle(x, y, 1.3);
    }

    pop();
  }
}

function mousePressed() {
  // Ensure audio context is started
  userStartAudio()
    .then(() => {
      console.log("Audio context started");
    })
    .catch((e) => {
      console.error("Failed to start audio context:", e);
    });
}
