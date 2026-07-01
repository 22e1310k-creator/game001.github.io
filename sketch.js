let player;
let lasers = [];
let enemyBullets = [];
let aliens = [];

let score = 0;
let lives = 3;
let gameOver = false;
let clear = false;

function setup() {
  createCanvas(600, 500);
  resetGame();
}

function draw() {
  background(10, 10, 30);

  drawStars();
  drawPlayer();
  drawLasers();
  drawEnemyBullets();
  drawAliens();
  drawInfo();

  if (gameOver) {
    drawEndText();
    return;
  }

  movePlayer();
  moveAliens();
  enemyAttack();
  checkLaserHit();
  checkEnemyBulletHit();
  checkEnd();
}

function drawStars() {
  fill(255);
  noStroke();

  for (let i = 0; i < 50; i++) {
    let x = (i * 97) % width;
    let y = (i * 53 + frameCount) % height;
    ellipse(x, y, 2, 2);
  }
}

function drawPlayer() {
  fill(80, 180, 255);
  noStroke();

  triangle(
    player.x, player.y - 20,
    player.x - 20, player.y + 20,
    player.x + 20, player.y + 20
  );

  fill(255);
  ellipse(player.x, player.y, 10, 10);
}

function movePlayer() {
  if (keyIsDown(LEFT_ARROW)) player.x -= 6;
  if (keyIsDown(RIGHT_ARROW)) player.x += 6;

  player.x = constrain(player.x, 25, width - 25);
}

function drawLasers() {
  for (let i = lasers.length - 1; i >= 0; i--) {
    let l = lasers[i];

    stroke(255, 80, 80);
    strokeWeight(4);
    line(l.x, l.y, l.x, l.y - 22);

    l.y -= 10;

    if (l.y < 0) {
      lasers.splice(i, 1);
    }
  }
}

function drawEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    let b = enemyBullets[i];

    fill(255, 230, 80);
    noStroke();
    ellipse(b.x, b.y, 10, 16);

    b.y += b.speed;

    if (b.y > height) {
      enemyBullets.splice(i, 1);
    }
  }
}

function drawAliens() {
  for (let alien of aliens) {
    fill(80, 255, 120);
    noStroke();

    ellipse(alien.x, alien.y, alien.size, alien.size * 0.7);
    ellipse(alien.x, alien.y - 15, alien.size * 0.8, alien.size * 0.7);

    fill(0);
    ellipse(alien.x - 10, alien.y - 18, 8, 10);
    ellipse(alien.x + 10, alien.y - 18, 8, 10);

    stroke(80, 255, 120);
    strokeWeight(4);
    line(alien.x - 12, alien.y + 12, alien.x - 20, alien.y + 25);
    line(alien.x + 12, alien.y + 12, alien.x + 20, alien.y + 25);
    noStroke();
  }
}

function moveAliens() {
  for (let alien of aliens) {
    alien.x += alien.speedX;
    alien.y += alien.speedY;

    // 左右の壁に当たったら反転
    if (alien.x < 30 || alien.x > width - 30) {
      alien.speedX *= -1;
    }

    // 少し揺れるように動く
    alien.x += sin(frameCount * alien.waveSpeed + alien.offset) * alien.waveSize;
  }
}

function enemyAttack() {
  for (let alien of aliens) {
    // 敵ごとに違う間隔で攻撃
    if (frameCount % alien.attackInterval === 0) {
      enemyBullets.push({
        x: alien.x,
        y: alien.y + 20,
        speed: alien.bulletSpeed
      });
    }
  }
}

function checkLaserHit() {
  for (let i = aliens.length - 1; i >= 0; i--) {
    for (let j = lasers.length - 1; j >= 0; j--) {
      let d = dist(aliens[i].x, aliens[i].y, lasers[j].x, lasers[j].y);

      if (d < aliens[i].size / 2) {
        aliens.splice(i, 1);
        lasers.splice(j, 1);
        score += 10;
        break;
      }
    }
  }
}

function checkEnemyBulletHit() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    let b = enemyBullets[i];
    let d = dist(player.x, player.y, b.x, b.y);

    if (d < 25) {
      enemyBullets.splice(i, 1);
      lives -= 1;

      if (lives <= 0) {
        gameOver = true;
        clear = false;
      }
    }
  }
}

function checkEnd() {
  if (aliens.length === 0) {
    gameOver = true;
    clear = true;
  }

  for (let alien of aliens) {
    if (alien.y > height - 90) {
      gameOver = true;
      clear = false;
    }
  }
}

function drawInfo() {
  fill(255);
  textSize(20);
  textAlign(LEFT);
  text("Score: " + score, 20, 30);
  text("Life: " + lives, 20, 60);
}

function drawEndText() {
  textAlign(CENTER);
  textSize(38);

  if (clear) {
    fill(255, 240, 80);
    text("CLEAR!", width / 2, height / 2);
  } else {
    fill(255, 80, 80);
    text("GAME OVER", width / 2, height / 2);
  }

  textSize(18);
  fill(255);
  text("Rキーでリスタート", width / 2, height / 2 + 45);
}

function keyPressed() {
  if (key === " " && !gameOver) {
    lasers.push({
      x: player.x,
      y: player.y - 25
    });
  }

  if (key === "r" || key === "R") {
    resetGame();
  }
}

function resetGame() {
  player = {
    x: width / 2,
    y: height - 50
  };

  lasers = [];
  enemyBullets = [];
  aliens = [];

  score = 0;
  lives = 3;
  gameOver = false;
  clear = false;

  for (let i = 0; i < 8; i++) {
    aliens.push({
      x: random(50, width - 50),
      y: random(40, 120),
      size: 40,

      // 敵ごとにバラバラの動き
      speedX: random(-3, 3),
      speedY: random(0.25, 0.8),

      // ゆらゆら動き
      waveSpeed: random(0.02, 0.06),
      waveSize: random(0.5, 2),
      offset: random(1000),

      // 攻撃性能もバラバラ
      attackInterval: floor(random(35, 100)),
      bulletSpeed: random(4, 8)
    });
  }
}
