document.getElementById("startSingleGame").addEventListener("click", singleplayer);
document.getElementById("startMultiGame").addEventListener("click", multiplayer);

function displayImage(input) {

	const ausgewaehlteDatei = input.files[0];
	const bildElemente = document.querySelectorAll('.profilbild');
	bildElemente.forEach(as =>
	{
		if (ausgewaehlteDatei)
		{
			const bildURL = URL.createObjectURL(ausgewaehlteDatei);
			as.src = bildURL;
			as.style.display = 'block';
		}
	});
}

function singleplayer()
{
	startGame(false);
}
function multiplayer()
{
	startGame(true);
}

class ElapsedTimer
{
	constructor()
	{
		this.startTime = new Date();
	}
	start()
	{
		this.startTime = new Date();
	}
	getElapsedMilliseconds()
	{
		const currentTime = new Date();
		return currentTime - this.startTime;
	}
	getElapsedSeconds()
	{
		return this.getElapsedMilliseconds() / 1000;
	}
}


function getToday()
{
	var footTime = document.getElementById("footTime");
	var footDay = document.getElementById("footDay");
	var jetzt = new Date();
	var stunden = jetzt.getHours();
	var minuten = jetzt.getMinutes();
	var tag = jetzt.getDate();
	var monat = jetzt.getMonth() + 1;

	minuten = minuten < 10 ? '0' + minuten : minuten;
	monat = monat < 10 ? '0' + monat : monat;
	tag = tag < 10 ? '0' + tag : tag;
	var uhrzeit = "🕔 " + stunden + ":" + minuten;

	var datum = " 📅 " + tag + "." + monat + "." + jetzt.getFullYear();
	footTime.textContent = uhrzeit;
	footDay.textContent = datum;
}

window.onload = (event) =>
{
	getToday();
}

function newElement(type, fontWeight, fontSize, position, left, right, top, bottom, transform)
{
	var newLabel = document.createElement(type);
	newLabel.style.fontWeight = fontWeight;
	newLabel.style.fontSize = fontSize;
	newLabel.style.position = position;
	newLabel.style.left = left;
	newLabel.style.right = right;
	newLabel.style.top = top;
	newLabel.style.bottom = bottom;
	newLabel.style.transform = transform;
	return newLabel;
}

function startGame(Multiplayer)
{
	var test = document.getElementById("body");
	test.style.margin = "-5";
	var test = document.getElementById("table");
	test.style.display = "none";
	var test = document.getElementById("tableHeader");
	test.style.display = "none";

	var leftName = document.getElementById("playername1").value;
	if (leftName == "")
		leftName = "Player 1";
	var rightName = document.getElementById("playername2").value;
	if (Multiplayer === true)
	{
		if (rightName == "")
			rightName = "Player 2";
	}
	else
		rightName = "Bot";
	let isRunning = true;

	const canvas = document.createElement("canvas");

	document.body.appendChild(canvas);

	canvas.style.width = "100vw";
	canvas.style.height = "100vh";
	canvas.style.margin = "-8px 0 0 -8px";
	const context = canvas.getContext("2d");

	var labelPunktestand = newElement("label", "bold", "50px", "fixed", "50%", "none", "50px", "none", "translate(-50%, -50%");
	labelPunktestand.textContent = "0 : 0";
	document.body.appendChild(labelPunktestand);

	var labelCountdownText = newElement("label", "bold", "50px", "fixed", "50%", "none", "40%","none", "translate(-50%, -50%");
	labelCountdownText.textContent = "";
	document.body.appendChild(labelCountdownText);

	var labelCountdown = newElement("label", "bold", "50px", "fixed", "50%", "none", "50%","none", "translate(-50%, -50%");
	labelCountdown.textContent = "";
	document.body.appendChild(labelCountdown);

	var labelTimer = newElement("label", "bold", "25px", "fixed", "50%", "none", "15px","none", "translate(-50%, -50%");
	labelTimer.textContent = "0 sec.";
	document.body.appendChild(labelTimer);

	var labelLeftPlayer = newElement("label", "bold", "25px", "fixed", "10px","none", "10px","none", "none");
	labelLeftPlayer.textContent = leftName;
	document.body.appendChild(labelLeftPlayer);

	var labelRightPlayer = newElement("label", "bold", "25px", "fixed", "none","10px", "10px","none", "none");
	labelRightPlayer.textContent = rightName;
	document.body.appendChild(labelRightPlayer);


	// Schläger
	const paddleWidth = 3, paddleHeight = 60;
	let leftPaddleY = (canvas.height - paddleHeight) / 2;
	let rightPaddleY = (canvas.height - paddleHeight) / 2;

	// Punktzahl
	let leftPlayer = 0;
	let rightPlayer = 0;
	let maxPoints = 5;
	let round = 0;

	// Ball
	let ballX = canvas.width / 2;
	let ballY = canvas.height / 2;
	let ballDia = 5;
	let ballRadius = ballDia / 2;
	let ballSpeedX = 3;
	let ballSpeedY = 1;
	let ballSpeedIncre = 1;

	function drawPaddle(x, y)
	{
		context.fillStyle = "#ffffff";
		context.fillRect(x, y, paddleWidth, paddleHeight);

	}
	function drawMiddle()
	{
		context.fillStyle = "#ffffff";
		let i = 10;
		while (i < canvas.height - 10)
		{
			context.fillRect(canvas.width / 2 - 1, i, 2, 5);
			i += 8;
		}

	}
	function drawBall(x, y)
	{
		context.fillStyle = "#ffffff";
		context.beginPath();
		context.arc(x, y, 4, 0, Math.PI * 2, false);
		context.fill();
	}
	function drawDot(x, y)
	{
		context.fillStyle = "#ff0000";
		context.beginPath();
		context.arc(x, y, 1, 0, Math.PI * 2, false);
		context.fill();
	}
	const keysState =
	{
		w: false,
		s: false,
		ArrowUp: false,
		ArrowDown: false,
	};

	document.addEventListener("keydown", function (event)
	{
		const key = event.key;

		if (keysState.hasOwnProperty(key))
			keysState[key] = true;
	});

	document.addEventListener("keyup", function (event)
	{
		const key = event.key;

		if (keysState.hasOwnProperty(key))
			keysState[key] = false;
	});

	const gametimer = new ElapsedTimer();
	function singleGame()
	{
		if (!isRunning)
			return;
		if (ballSpeedX > 0 && ballX >= canvas.width / 2)
		{
			if (rightPaddleY < ballY - paddleHeight / 2)
			rightPaddleY++;
			else if (rightPaddleY > ballY - paddleHeight / 2)
				rightPaddleY--;
		}

		// if (ballSpeedX < 0 && ballX <= canvas.width / 2)
		// {
		// 	if (leftPaddleY < ballY - paddleHeight / 2)
		// 		leftPaddleY++;
		// 	else if (leftPaddleY > ballY - paddleHeight / 2)
		// 		leftPaddleY--;
		// }
		if (rightPaddleY < 0)
			rightPaddleY = 0;
		else if (rightPaddleY > canvas.height - paddleHeight)
			rightPaddleY = canvas.height - paddleHeight;

		// if (leftPaddleY < 0)
		// 	leftPaddleY = 0;
		// else if (leftPaddleY > canvas.height - paddleHeight)
		// 	leftPaddleY = canvas.height - paddleHeight;
	}
	function updateGame() {

		if (!isRunning)
			return;
		if (keysState["w"])
			leftPaddleY--;
		if (keysState["s"])
			leftPaddleY++;
		if (keysState["ArrowUp"])
			rightPaddleY--;
		if (keysState["ArrowDown"])
			rightPaddleY++;

		if (rightPaddleY < 0)
			rightPaddleY = 0;
		else if (rightPaddleY > canvas.height - paddleHeight)
			rightPaddleY = canvas.height - paddleHeight;

		if (leftPaddleY < 0)
			leftPaddleY = 0;
		else if (leftPaddleY > canvas.height - paddleHeight)
			leftPaddleY = canvas.height - paddleHeight;

		labelTimer.textContent = Math.floor(gametimer.getElapsedSeconds()) + " sec.";
	}

	const delay = ms => new Promise(res => setTimeout(res, ms));
	let updateGameID;
	let singleGameID;
	const resetGame = async () =>
	{
		round++;
		context.fillStyle = "#000000";
		context.fillRect(0, 0, canvas.width, canvas.height);
		if (round === 1)
			labelCountdownText.textContent = "Spiel startet...";
		else
			labelCountdownText.textContent = "Runde " + round + " startet...";
		for (let i = 3; i > 0; i--)
		{
			labelCountdown.textContent = i;
			await delay(500);
		}
		labelCountdown.textContent = "";
		labelCountdownText.textContent = "";
		ballX = canvas.width / 2;
		ballY = canvas.height / 2;
		leftPaddleY = (canvas.height - paddleHeight) / 2;
		rightPaddleY = (canvas.height - paddleHeight) / 2;
		ballSpeedY = 1;
		isRunning = true;
		ballSpeedIncre = 1;
		gameLoop();
		gametimer.start();
		updateGameID = setInterval(updateGame, 1000 / 100);
		if (Multiplayer === false)
			singleGameID = setInterval(singleGame, 1000 / 100);
		checkTimer();
	}

	const checkStatus = async () =>
	{
		if (!isRunning)
		{
			clearInterval(updateGameID);
			clearInterval(singleGameID);
			if (ballX < paddleWidth)
			{
				rightPlayer++;
				ballSpeedX = -3;
			}
			else if (ballX > canvas.width - paddleWidth)
			{
				leftPlayer++;
				ballSpeedX = 3;
			}
			labelCountdownText.textContent = leftPlayer === maxPoints ? leftName + " hat gewonnen" : rightPlayer === maxPoints ? rightName + " hat gewonnen" : "";
			labelPunktestand.textContent = leftPlayer + " : " + rightPlayer;
			await delay(2500);
			if (leftPlayer === maxPoints || rightPlayer === maxPoints)
				return;
			await resetGame();
		}
	}
	const checkTimer = async () =>
	{
		while (isRunning)
		{
			const timer = new ElapsedTimer();
			timer.start();
			while (timer.getElapsedSeconds() < 5)
			{
				if (!isRunning)
					return ;
				await delay(100);
			}
			ballSpeedIncre += 0.1;
		}

	}

	function gameLoop()
	{

		if (isRunning)
		{
			ballX += ballSpeedX * ballSpeedIncre;
			ballY += ballSpeedY * ballSpeedIncre;

			if (ballY < ballDia || ballY > canvas.height - ballDia)
				ballSpeedY = -ballSpeedY;


			if ((ballX < paddleWidth + ballDia && ballY + ballRadius > leftPaddleY && ballY - ballRadius < leftPaddleY + paddleHeight) ||
				(ballX > canvas.width - paddleWidth - ballDia && ballY + ballRadius > rightPaddleY && ballY - ballRadius < rightPaddleY + paddleHeight))
				ballSpeedX = -ballSpeedX;

			if (ballX + ballRadius  < paddleWidth || ballX - ballRadius > canvas.width - paddleWidth)
				isRunning = false;

			context.fillStyle = "#000000";
			context.fillRect(0, 0, canvas.width, canvas.height);

			drawPaddle(1, leftPaddleY);
			drawPaddle(canvas.width - paddleWidth - 1, rightPaddleY);
			drawBall(ballX, ballY);
			drawMiddle();
			requestAnimationFrame(gameLoop);
		}
		else
			checkStatus();

	}
	resetGame();
}
// // oben
// drawDot(ballX, ballY - 2.5);
// // rechts
// drawDot(ballX + 2.5, ballY);
// // unten
// drawDot(ballX, ballY + 2.5);
// // links
// drawDot(ballX - 2.5, ballY);