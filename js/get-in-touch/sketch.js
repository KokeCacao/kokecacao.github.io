// https://openprocessing.org/sketch/1147964
// simulation and game: https://explorabl.es/

// lib
let scribble;

// Web API: https://postman-toolboxes.github.io/covid-19/#featured-collections
let obj;
let newConfirmed = 549066;
let totalConfirmed = 128271711;
let newDeaths = 11236;
let totalDeaths = 2804567;
let newRecovered = 311130;
let totalRecovered = 72855905;
// https://documenter.getpostman.com/view/10808728/SzS8rjbc
// "Global": {
//   "NewConfirmed": 100282,
//   "TotalConfirmed": 1162857,
//   "NewDeaths": 5658,
//   "TotalDeaths": 63263,
//   "NewRecovered": 15405,
//   "TotalRecovered": 230845
// }
// Processed Web API Data
let infectionRate = newConfirmed / 10000000;
let recoveredRate = infectionRate;

// Objects
let globalTime = 0;
let ppl = [];
let sprays = [];
let mypX;
let mypY;
let myX;
let myY;
let myEnergy = 100;
let mySprintDisabled = false;
let myColor = "#000000";
let spraySize = 5;
let score = 1000;
let locked = false;

// Constants
let seed = 19;
let sizeppl = 20;
let sizeperson = 30;
let personAngle = 0;
let myDefaultSpeed = 1.5;
let myRushSpeed = 5;
let stopChance = 1 / 200;
let myTotalEnergy = 100;
let sprayTime = 400;
let sprayLimit = 20;

// Library:
// https://github.com/bmoren/p5.collide2D
// https://github.com/generative-light/p5.scribble.js

// Did Not use:
// https://github.com/ml5js/ml5-library https://ml5js.org/
// https://github.com/linux-man/p5.tiledmap
// https://www.who.int/data/gho/info/athena-api
// https://www.who.int/data/gho/info/gho-odata-api

function setup() {
  scribble = new Scribble();
  createCanvas(windowWidth, windowHeight);
  init();
}

function init() {

  globalTime = 0;
  ppl = [];
  sprays = [];
  mypX;
  mypY;
  myX;
  myY;
  myEnergy = 100;
  mySprintDisabled = false;
  myColor = "#000000";
  spraySize = 5;
  score = 1000;
  locked = false;

  const settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://api.covid19api.com/summary",
    "method": "GET",
    "headers": {
      "X-Access-Token": "5cf9dfd5-3449-485e-b5ae-70a60e997864"
    }
  };

  $.ajax(settings).done(function (response) {
    print(response["Global"]);
    obj = response["Global"];
    newConfirmed = obj["NewConfirmed"];
    totalConfirmed = obj["TotalConfirmed"];
    newDeaths = obj["NewDeaths"];
    totalDeaths = obj["TotalDeaths"];
    newRecovered = obj["NewRecovered"];
    totalRecovered = obj["TotalRecovered"];

    print("We have " + newConfirmed + " new confirmed.");
  });

  for (let i = 0; i < 20; i++) {
    let color = "#000000";
    if (random() < infectionRate) color = "#FF0000"
    else if (random() < recoveredRate) color = "#00FF00";
    ppl.push(new Boid(color, "moving"));
  }

  mypX = width / 2;
  mypY = height / 2;
  myX = width / 2;
  myY = height / 2;

  // (function () {
  //   var API = "https://api.covid19api.com/summary";
  //   $.getJSON(API, {
  //     "X-Access-Token": "5cf9dfd5-3449-485e-b5ae-70a60e997864"
  //   })
  //     .done(function (data) {
  //       print(data);
  //     });
  // })();
}

function draw() {
  globalTime++;
  // randomSeed(seed);
  if (obj != null) { // TODO
    if (!locked) background(255);
    else background(210);

    push();
    fill(0, 102, 153);
    textSize(64);
    text("Score: " + str(score), 10, height - 50);
    textSize(20);
    text("NewConfirmed: " + str(newConfirmed) + "; NewRecovered: " + str(newRecovered) + "; InfectionRate: " + str(Math.round(infectionRate * 100)) + "%", 10, height - 25)
    text("Objective: get in touch with people! [LeftClick]: sprint; [SPACE]: cough; [L]: lock/unlock room; [R]: restart", 10, height - 5)
    pop();

    let speed = myDefaultSpeed;
    if (myEnergy > 50) mySprintDisabled = false;
    if (!mySprintDisabled && mouseIsPressed && myEnergy > 0) {
      speed = myRushSpeed;
      myEnergy = myEnergy - 2;
    } else {
      if (myEnergy < myTotalEnergy) myEnergy++;
      mySprintDisabled = true;
    }
    angle = Math.atan2(mouseY - myY, mouseX - myX);
    mypX = myX;
    mypY = myY;
    myX += Math.cos(angle) * speed;
    myY += Math.sin(angle) * speed;
    myX = myX % width;
    myY = myY % height;

    let badCollide = false;
    let goodCollide = false;
    for (let i = 0; i < ppl.length; i++) {
      let boid = ppl[i];

      // check collision
      if (myColor == "#000000") {
        if (boid.color == "#FF0000") badCollide = badCollide || collideCircleCircle(myX, myY, sizeperson, boid.position.x, boid.position.y, sizeppl);
        else goodCollide = goodCollide || collideCircleCircle(myX, myY, sizeperson, boid.position.x, boid.position.y, sizeppl);
      } else if (myColor == "#FF0000" && collideCircleCircle(myX, myY, sizeperson, boid.position.x, boid.position.y, sizeppl)) {
        if (boid.color == "#000000") {
          boid.setColor("#FF0000");
          score -= 100;
        }
      }

      for (let j = 0; j < sprays.length; j++) {
        let spray = sprays[j];
        if (p5.Vector.dist(spray.position, boid.position) < sizeppl) {
          boid.setColor("#FF0000");
        }
      }

      boid.edges();
      boid.flock(ppl);
      boid.update();
      boid.show();
    }
    if (goodCollide) {
      score += 1;
    }

    if (badCollide) {
      myColor = "#FF0000";
      score -= 1000;
    }
    push();
    stroke(myColor);
    scribble.scribbleEllipse(myX, myY, sizeperson, sizeperson);
    if (abs(myX - mypX) > 1 && abs(myY - mypY) > 1)
      personAngle = 90 + 180 * Math.atan((myY - mypY) / (myX - mypX));

    scribbleFillingCircle(myX, myY, map(myEnergy, 0, 100, 1, sizeperson), 10, 4, personAngle);
    pop();

    for (let i = 0; i < sprays.length; i++) {
      let spray = sprays[i];
      spray.update();
      spray.show();
      if (spray.time < 1) {
        sprays.splice(i, 1);
        i--;
      }
      if (myColor != "#FF0000" && collideCircleCircle(myX, myY, sizeperson, spray.position.x, spray.position.y, spraySize)) {
        myColor = "#FF0000";
        score -= 1000;
      }
    }
  }
}

function keyPressed(e) {
  if (e.keyCode == 32 && myColor == "#FF0000") {
    for (i = 0; i < 3; i++) {
      if (sprays.length > sprayLimit) sprays.shift();
      sprays.push(new Spray(myColor,
        myX,
        myY,
        mouseX - myX,
        mouseY - myY,
        10, spraySize));
    }
  }
  if (e.keyCode == 76) {
    locked = !locked;
  }
  if (e.keyCode == 82) {
    init();
  }
}

class Spray {
  constructor(color, x, y, dx, dy, speed, r) {
    this.color = color;
    this.position = createVector(x, y);
    this.velocity = createVector(dx, dy);
    this.velocity.setMag(speed);
    this.r = r
    this.time = sprayTime;
  }
  update() {
    this.time--;
    this.velocity.setMag(this.velocity.mag() - 1);
    this.position.add(this.velocity);
  }
  show() {
    push();
    translate(this.position.x, this.position.y);
    rotate(HALF_PI + atan2(this.velocity.y, this.velocity.x));
    let c = color(this.color);
    c.setAlpha(map(this.time, 0, sprayTime, 20, 255));
    stroke(c);
    scribble.scribbleRoundedRect(0, 0, this.r, this.r, this.r / 5);
    pop();
  }
}

class Boid {
  constructor(color, state) {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector();
    this.maxForce = 0.2;
    this.maxSpeed = 5;
    this.color = color;
    this.state = state;
    this.stateCoolDown = -1;
  }

  setColor(color) {
    this.color = color;
  }

  randomColor() {
    if (locked && random() < 0.5) return;

    let color = "#000000";
    if (random() < infectionRate) color = "#FF0000"
    else if (random() < recoveredRate) color = "#00FF00";
    this.color = color
  }

  edges() {
    if (this.position.x > width) {
      this.position.x = 0;
      this.randomColor();
    } else if (this.position.x < 0) {
      this.position.x = width;
      this.randomColor();
    }
    if (this.position.y > height) {
      this.position.y = 0;
      this.randomColor();
    } else if (this.position.y < 0) {
      this.position.y = height;
      this.randomColor();
    }
  }

  align(boids) {
    let perceptionRadius = 25;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  separation(boids) {
    let perceptionRadius = 24;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d * d);
        steering.add(diff);
        total++;
        if (this.color == "#FF0000" && other.color != "#00FF00") other.color = "#FF0000";
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  cohesion(boids) {
    let perceptionRadius = 50;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        steering.add(other.position);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.sub(this.position);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  flock(boids) {
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);

    alignment.mult(0.75); // 1.5~0.1
    cohesion.mult(0.5); // 1.0~0.1
    separation.mult(1.0); // 2.0~0.1

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  }

  update() {
    if (this.state == "moving") {
      this.position.add(this.velocity);
      this.velocity.add(this.acceleration);
      this.velocity.limit(this.maxSpeed);
      this.acceleration.mult(0);

      if (random(0, 100) < 0.1) {
        this.state = "stop";

        if (this.color == "#FF0000") {
          for (i = 0; i < 3; i++) {
            if (sprays.length > sprayLimit) sprays.shift();
            sprays.push(new Spray(this.color,
              this.position.x,
              this.position.y,
              this.velocity.x + random(-3, 3),
              this.velocity.y + random(-3, 3),
              this.velocity.mag() * 3, spraySize));
          }
        }

        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(2, 4));
        this.stateCoolDown = 100;
      }
    } else if (this.state == "stop") {
      this.stateCoolDown -= 1;
      if (this.stateCoolDown <= 0) this.state = "moving"
    } else {
      print("Error: no state detected");
    }
  }

  show() {
    push();
    translate(this.position.x, this.position.y);
    rotate(HALF_PI + atan2(this.velocity.y, this.velocity.x));
    // triangle(-3, 5, 0, -5, 3, 5);
    fill(255);
    stroke(this.color);
    scribble.scribbleRoundedRect(0, 0, sizeppl, sizeppl, sizeppl / 5);
    scribble.scribbleFilling([-sizeppl / 2, sizeppl / 2, sizeppl / 2, -sizeppl / 2], [-sizeppl / 2, -sizeppl / 2, sizeppl / 2, sizeppl / 2], sizeppl / 5, 0);
    pop();
  }
}

function scribbleFillingCircle(x, y, r, sampleSize, gap, angle) {
  let xCoords = [];
  let yCoords = [];

  for (i = 0; i < 2 * PI; i += 2 * PI / sampleSize) {
    xCoords.push(x + Math.sin(i) * r / 2);
    yCoords.push(y + Math.cos(i) * r / 2);
  }
  scribble.scribbleFilling(xCoords, yCoords, gap, angle);
}