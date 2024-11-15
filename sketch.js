let flowers = [];
let numFlowers = 8;
let mic;
let micLevel = 0;
let glowAmount = 0;
let vid;

function preload(){
  vid = createVideo("terrain.mp4")
}

class Flower {
  constructor(x, y, size, hueOffset) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.hueOffset = hueOffset;
    this.numPetals = 12;
    this.numLayers = 5;
    this.rotationOffset = random(360);
  }
  
  draw(micLevel, glowAmount) {
    push();
    translate(this.x, this.y);
    scale(this.size);
    
    this.rotationOffset += 0.2 + micLevel * 2; // Increased rotation response
    
    // Draw the glow effect
    drawingContext.shadowBlur = 30 + glowAmount * 4; // Increased glow response
    drawingContext.shadowColor = color((300 + this.hueOffset) % 360, 80, 60, 0.5);
    //drawingContext.shadowColor = color(300, 10, 70, 0.5);
    
    // Draw multiple layers of petals
    for(let layer = this.numLayers; layer > 0; layer--) {
      let baseLayerSize = map(layer, 1, this.numLayers, 20, 80);
      let layerSize = baseLayerSize * (1 + micLevel);  // Increased size response
      
      let hue, saturation, brightness;
      if (this.hueOffset < 0) {
        hue = (map(layer, 1, this.numLayers, 347, 325) + this.hueOffset) % 360; // EA8384
        saturation = map(layer, 1, this.numLayers, 90, 60 + micLevel * 40);
        brightness = map(layer, 1, this.numLayers, 95 + glowAmount, 85 + glowAmount);
      } else if (this.hueOffset < 60) {
        hue = (map(layer, 1, this.numLayers, 320, 300) + this.hueOffset) % 360; // CE9BBE
        saturation = map(layer, 1, this.numLayers, 90, 60 + micLevel * 40);
        brightness = map(layer, 1, this.numLayers, 95 + glowAmount, 85 + glowAmount);
      } else if (this.hueOffset < 120) {
        hue = (map(layer, 1, this.numLayers, 320, 300) + this.hueOffset) % 360; // DCACCE
        saturation = map(layer, 1, this.numLayers, 90, 60 + micLevel * 40);
        brightness = map(layer, 1, this.numLayers, 95 + glowAmount, 85 + glowAmount);
      } else if (this.hueOffset < 180) {
        hue = (map(layer, 1, this.numLayers, 40, 20) + this.hueOffset) % 360; // DAC192
        saturation = map(layer, 1, this.numLayers, 90, 60 + micLevel * 40);
        brightness = map(layer, 1, this.numLayers, 95 + glowAmount, 85 + glowAmount);
      } else if (this.hueOffset < 240) {
        hue = (map(layer, 1, this.numLayers, 60, 40) + this.hueOffset) % 360; // C7C33F
        saturation = map(layer, 1, this.numLayers, 90, 60 + micLevel * 40);
        brightness = map(layer, 1, this.numLayers, 95 + glowAmount, 85 + glowAmount);
      } else {
        hue = (map(layer, 1, this.numLayers, 90, 70) + this.hueOffset) % 360; // 817E43
        saturation = map(layer, 1, this.numLayers, 90, 60 + micLevel * 40);
        brightness = map(layer, 1, this.numLayers, 95 + glowAmount, 85 + glowAmount);
      }
      
      push();
      rotate(this.rotationOffset * (layer/2));
      
      for(let i = 0; i < this.numPetals; i++) {
        let angle = (360 / this.numPetals) * i;
        let petalSize = layerSize * (1 + 0.2 * sin(frameCount * 2 + layer * 30) + micLevel);
        
        push();
        rotate(angle);
        fill(hue, saturation, brightness);
        
        beginShape();
        for(let t = 0; t <= 1; t += 0.01) {
          let pulseEffect = 1 + micLevel * sin(frameCount * 4 + layer * 30) * 0.5;
          let px = petalSize * pow(sin(t * 180), 0.5) * pulseEffect;
          let py = petalSize * (0.5 * sin(t * 180) + 0.5 * sin(t * 180 * 2)) * pulseEffect;
          vertex(px, py);
        }
        for(let t = 1; t >= 0; t -= 0.01) {
          let pulseEffect = 1 + micLevel * sin(frameCount * 4 + layer * 30) * 0.5;
          let px = -petalSize * pow(sin(t * 180), 0.5) * pulseEffect;
          let py = petalSize * (0.5 * sin(t * 180) + 0.5 * sin(t * 180 * 2)) * pulseEffect;
          vertex(px, py);
        }
        endShape(CLOSE);
        pop();
      }
      pop();
    }
    
    // Draw center
    drawingContext.shadowBlur = 20 + glowAmount;
    drawingContext.shadowColor = color(45 + this.hueOffset/4, 80, 100, 0.6);
    
    for(let i = 5; i > 0; i--) {
      let size = map(i, 1, 5, 4, 16) * (1 + micLevel * 0.5);
      let brightness = map(i, 1, 5, 60, 90 + glowAmount);
      fill(45 + this.hueOffset/4, 80, brightness);
      circle(0, 0, size);
    }
    
    // Pollen details
    for(let i = 0; i < 12; i++) {
      let angle = random(360);
      let radius = random(6);
      let x = cos(angle) * radius;
      let y = sin(angle) * radius;
      fill(45 + this.hueOffset/4, 60, 100);
      circle(x, y, 1.3);
    }
    
    pop();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  colorMode(HSB, 360, 100, 100, 1);
  noStroke();
  //vid.hide();
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
  
  // Get microphone level with amplification and smoothing
  let targetLevel = mic.getLevel();
  micLevel = lerp(micLevel, targetLevel * 5, 0.1); // Increased amplification
  glowAmount = lerp(glowAmount, micLevel * 100, 0.1); // Increased glow response
  
  // Dynamic background
  //let bgBrightness = map(micLevel, 0, 1, 95, 85);
  //background(110, 30, 80);
  image(vid, 0, windowHeight-900);
  vid.loop();
  // Draw all flowers
  for(let flower of flowers) {
    flower.draw(micLevel, glowAmount);
  }
  
  // Debug information
  // fill(0);
  // noStroke();
  // textSize(16);
  // text(`Mic Level: ${micLevel.toFixed(3)}`, 20, 30);
  // text(`Glow Amount: ${glowAmount.toFixed(3)}`, 20, 50);
  
  // // Draw mic level meter
  // fill(200, 80, 80);
  // rect(20, 60, micLevel * 200, 20);
}



function mousePressed() {
  // Ensure audio context is started
  userStartAudio().then(() => {
    console.log('Audio context started');
  }).catch(e => {
    console.error('Failed to start audio context:', e);
  });
}


// function keyPressed() {
//   // Alternative way to start audio
//   userStartAudio();
// }