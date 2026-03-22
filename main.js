// document.documentElement.requestFullscreen();
let bgm = new Audio(); bgm.src = 'sfx/bgm2.mp3';
document.querySelector('.startButton').addEventListener('click',()=>{
	document.querySelector('.starting_menu').style.display='none';
	// document.documentElement.requestFullscreen();
	startGame();
	bgm.play();
	bgm.loop=true;
	bgm.volume=0.2;
	setTimeout(function(){gameStart=true},200)
	// document.querySelector('body').style.cursor='none';
})

if (innerWidth>491){
	document.querySelector('.controls').style.display='none';
}

function mobileOrpc(){
	if (innerWidth<491) {
		return document.querySelector('.shootButton');
	}else{
		return document;
	}
}

let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');

canvas.height = innerHeight;
canvas.width  = innerWidth;

// store that if game is started or not
let gameStart=false;

let keys={};
let bullets=[];
let enemies=[];
let score=0;
let bulletFiring=false;
let ammo=1000;
let reloading = false;
let level = 4;

// import textures
let player_texture = new Image(); player_texture.src='player.png';
let enemy_easy = new Image(); enemy_easy.src='enemy_easy.png';
let enemy_medium = new Image(); enemy_medium.src='enemy_medium.png';
let enemy_hard = new Image(); enemy_hard.src='enemy_hard.png';
let bullet_tex = new Image(); bullet_tex.src='bullet.png';
let background = new Image(); background.src='bg.png';
let bullet_hit = new Image(); bullet_hit.src='bullet_effect.png'
// sprite
const blastImg = new Image();
blastImg.src = "blast2.png"; // put your image name here
// details of spritesheet of bullet effect

// sprite settings (blast effect)
const frameWidth = 256;
const frameHeight = 256;
const totalFrames = 10;
const cols = 10;
const speed = 4; // smaller = faster

// sprite settings (blast effect)
const b_h_frameWidth = 60;
const b_h_frameHeight = 60;
const b_h_totalFrames = 9;
const b_h_cols = 9;
const b_h_speed = 4; // smaller = faster

let blasts = [];
let bulletHit = [];

// create bullet impact
function createBlast(x, y) {
  blasts.push({
    x: x - frameWidth/2,
    y: y - frameHeight/2,
    frame: 0,
    tick: 0
  });
}

// create blast effect
function createBulletHit(x, y) {
  bulletHit.push({
    x: x - b_h_frameWidth/2,
    y: y - b_h_frameHeight/2,
    frame: 0,
    tick: 0
  });
}
// import musics and sfx
let mainTheme = new Audio(); mainTheme.src='sfx/gameTheme.mp3';
let fire_sfx = new Audio(); fire_sfx.src='sfx/fire.wav';
let hit_sfx = new Audio(); hit_sfx.src='sfx/plane_blast.wav';
let bullet_hit_plane = new Audio(); bullet_hit_plane.src='sfx/plane_hit.wav';

// create a player
class Player{
	constructor(){
		this.height = 30;
		this.width = 30;
		this.position={x:canvas.width/2, y:canvas.height-200};
		this.speed=5;
	}
	draw(){
		ctx.drawImage(player_texture,this.position.x, this.position.y, this.width, this.height);
		// ctx.fillStyle='red';
		// ctx.fillRect(this.position.x,this.position.y,this.width,this.height);
	}
	update(){


		ctx.fillStyle='#000';
		ctx.fillRect(0,0,canvas.width,canvas.height);''
		// ctx.drawImage(background,0,0,canvas.width,canvas.height);
		this.draw();

		

		ctx.fillStyle='#fff';
		ctx.font='24px Arial'
		ctx.fillText(`Score: ${score}`,23,67)

		if (!reloading) {
			ctx.fillStyle='#fff';
			ctx.font='24px Arial'
			ctx.fillText(`Ammo: ${ammo}`,200,67)
		}else{
			ctx.fillStyle='#fff';
			ctx.font='24px Arial'
			ctx.fillText(`reloading...`,200,67);

		}

		if (keys['a']) this.position.x-=this.speed;
		if (keys['d']) this.position.x+=this.speed;

		this.position.x=Math.max(0,Math.min(canvas.width-this.width,this.position.x));

		// fire bullets
		bullets.forEach((e,i)=>{
			ctx.drawImage(bullet_tex,e.x,e.y,e.w,e.h);
			e.y-=e.speed;

			if (e.y+e.h<0){
				bullets.splice(i,1);
			}
		})

		// generate enemies
		enemies.forEach((e,i)=>{
			if (e.speed==0.5){ctx.drawImage(enemy_easy,e.x,e.y,e.w,e.h)};
			if (e.speed==0.7){ctx.drawImage(enemy_medium,e.x,e.y,e.w,e.h)};
			if (e.speed==1){ctx.drawImage(enemy_hard,e.x,e.y,e.w,e.h)};

			// ctx.fillStyle='green';
			// ctx.fillRect(e.x,e.y,e.w,e.h);
			e.y+=e.speed;

			if (e.y>canvas.height){
				enemies.splice(i,1);
			}
		})

		// detect collition between bullets and enemies
			bullets.forEach((bulletE, bulletI)=>{
				enemies.forEach((enemyE,enemyI)=>{
					if (
						bulletE.x<enemyE.x+enemyE.w &&
						bulletE.x+bulletE.w>enemyE.x &&
						bulletE.y<enemyE.y+enemyE.h &&
						bulletE.y+bulletE.h>enemyE.y
						) {
					
					if (enemyE.health<1) {
						enemies.splice(enemyI,1)
						score+=1;
						shake(5);
						createBlast(enemyE.x+enemyE.w/2,enemyE.y+enemyE.h/2)
						hit_sfx.play();
						hit_sfx.currentTime=0;	
					}
					createBulletHit(bulletE.x,bulletE.y+30)
					bullet_hit_plane.play();
					bullet_hit_plane.currentTime=0;
					shake(2);
					enemyE.health-=5;
					bullets.splice(bulletI,1);
				}
				})
			})
	// logic of when blast a plane
	for (let i = blasts.length - 1; i >= 0; i--) {
    let b = blasts[i];

    b.tick++;
    if (b.tick % speed === 0) {
      b.frame++;
    }

    let col = b.frame % cols;
    let row = Math.floor(b.frame / cols);

    ctx.drawImage(
      blastImg,
      col * frameWidth,
      row * frameHeight,
      frameWidth,
      frameHeight,
      b.x,
      b.y,
      frameWidth,
      frameHeight
    );

    // remove after animation ends
    if (b.frame >= totalFrames) {
      blasts.splice(i, 1);
    }
  }
  	// logic of when bullet hit a plane
	for (let i = bulletHit.length - 1; i >= 0; i--) {
    let b = bulletHit[i];

    b.tick++;
    if (b.tick % b_h_speed === 0) {
      b.frame++;
    }

    let b_h_col = b.frame % b_h_cols;
    let b_h_row = Math.floor(b.frame / b_h_cols);

    ctx.drawImage(
      bullet_hit,
      b_h_col * b_h_frameWidth,
      b_h_row * b_h_frameHeight,
      b_h_frameWidth,
      b_h_frameHeight,
      b.x,
      b.y,
      b_h_frameWidth,
      b_h_frameHeight
    );

    // remove after animation ends
    if (b.frame >= b_h_totalFrames) {
      bulletHit.splice(i, 1);
    }
  }
	}
}

let player = new Player();

if (innerWidth>493){
	// when player press the key
	document.addEventListener('keydown',e=>{keys[e.key.toLowerCase() ]= true});

	// when player release the key
	document.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]= false});
}else{
	// left control button on mobile
	document.querySelector('.left').addEventListener('touchstart',()=>{
		keys.a=true;
	})
	document.querySelector('.left').addEventListener('touchend',()=>{
		keys.a=false;
	})

	// right control button on mobile
	document.querySelector('.right').addEventListener('touchstart',()=>{
		keys.d=true;
	})
	document.querySelector('.right').addEventListener('touchend',()=>{
		keys.d=false;
	})
}

let firingSpeed = 100;
// when player click on left mouse button - shoot
if (innerWidth>493) {
window.addEventListener('mousedown',()=>{
	bulletFiring=true;
	let fireo = setInterval(function(){
		if (bulletFiring===true && gameStart==true && ammo>0 && !reloading) {
			fire_sfx.play();
		fire_sfx.currentTime=0;
		bullets.push({
			x:player.position.x+player.width/2-3,
			y:player.position.y-14,
			h:20,
			w:5,
			speed:7
		})
		ammo-=1;
	}else{
		clearInterval(fireo)
		if (ammo==0){
			reloading=true;
			setTimeout(function(){
				ammo=1000;
				reloading=false;
			},4000)
		}
	}
	},firingSpeed)
})
window.addEventListener('mouseup',()=>{
	bulletFiring=false;
})
}else{
document.querySelector('.shootButton').addEventListener('touchstart',()=>{
	bulletFiring=true;
	let fireo = setInterval(function(){
		if (bulletFiring===true && gameStart==true && ammo>0 && !reloading) {
			fire_sfx.play();
		fire_sfx.currentTime=0;
		bullets.push({
			x:player.position.x+player.width/2-3,
			y:player.position.y-14,
			h:20,
			w:5,
			speed:7
		})
		ammo-=1;
	}else{
		clearInterval(fireo)
		if (ammo==0){
			reloading=true;
			setTimeout(function(){
				ammo=1000;
				reloading=false;
			},4000)
		}
	}
	},firingSpeed)
})
document.querySelector('.shootButton').addEventListener('touchend',()=>{
	bulletFiring=false;
})
}

window.addEventListener('keydown',e=>{
	if (e.key==='r') {
		console.log(e.key)
		reloading = true;
		setTimeout(function(){
				ammo=1000;
				reloading=false;
			},4000)
	}
})
// generate random enemies
let enemies_speed=[0.5,0.7,1];
function startGame(){
	setInterval(function(){
	if (enemies.length<level){
		enemies.push({
			h:50,
			w:50,
			x:Math.floor(Math.random()*canvas.width-20),
			y:-40,
			speed:enemies_speed[Math.floor(Math.random()*enemies_speed.length)],
			health:20
		})
	}

	if (score>10) {
		level=10;
	}
},1000)
}

function shake(times){
		let left=times;
		let time = setInterval(function(){
			let sh = [2,-4,4,-2];
			if (left<1){
				clearInterval(time);
				canvas.style.top=0;
				canvas.style.left=0;
			}else{
				canvas.style.top=sh[Math.floor(Math.random()*sh.length)]+'px';
				canvas.style.left=sh[Math.floor(Math.random()*sh.length)]+'px';
				left-=1;
			}
		},70)
	}

function newFrames(){
	ctx.clearRect(0,0,canvas.width,canvas.height);
	player.update();
	requestAnimationFrame(newFrames);
}
newFrames();