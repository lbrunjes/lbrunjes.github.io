int total = 10;
Particle[] parray = new Particle[total];

void setup() {
  //[full] This is what we’re used to, accessing elements on the array via an index and brackets—[ ].
  for (int i = 0; i < parray.length; i++) {
    parray[i] = new Particle();
  }
  //[end]
}

void draw() {
  for (int i = 0; i < parray.length; i++) {
    Particle p = parray[i];
    p.run();
  }
}

// A class to describe a group of Particles
// An ArrayList is used to manage the list of Particles 

class ParticleSystem {
  ArrayList<Particle> particles;
  PVector origin;

  ParticleSystem(PVector position) {
    origin = position.copy();
    particles = new ArrayList<Particle>();
  }

  void addParticle() {
    particles.add(new Particle(origin));
  }

  void run() {
    //for (int i = particles.size()-1; i >= 0; i--) {
      for (int i = particles.size()-1; i >= 0; i--) {
      Particle p = particles.get(i);
      p.run();
      if (p.isDead()) {
        particles.remove(i);
      }
    }
  }
}


// A simple Particle class

class Particle {
  PVector position =new PVector(0, 0);
  PVector velocity= new PVector(random(-1, 1), random(-2, 0));
  PVector acceleration=new PVector(0, 0.05);
  float lifespan =255.0;

  Particle(PVector l) {
    acceleration = new PVector(0, 0.05);
    velocity = new PVector(random(-1, 1), random(-2, 0));
    position = l.copy();
    lifespan = 255.0;
  }

  void run() {
    update();
    display();
  }

  // Method to update position
  void update() {

    console.log( velocity, this.velocity, this);
    velocity.add(acceleration);
    position.add(velocity);
    lifespan -= 1.0;
  }

  // Method to display
  void display() {
    stroke(255, lifespan);
    fill(255, lifespan);
    ellipse(position.x, position.y, 8, 8);
  }

  // Is the particle still useful?
  boolean isDead() {
    if (lifespan < 0.0) {
      return true;
    } else {
      return false;
    }
  }
}
