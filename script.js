document.getElementById("startSingleGame").addEventListener("click", singleplayer);
document.getElementById("startMultiGame").addEventListener("click", multiplayer);
document.getElementById("startBotGame").addEventListener("click", botplayer);
class Matchmaking
{
	constructor()
	{
		this.playerName1 = "";
		this.playerName2 = "";
		this.matches = [[]];
	}
}

class GameRules
{
	constructor(height, width)
	{
		// Schläger
		this.paddleWidth = 3;
		this.paddleHeight = 30;
		this.leftPaddleY = (height - this.paddleHeight) / 2;
		this.rightPaddleY = (height - this.paddleHeight) / 2;

		// Punktzahl
		this.leftPlayer = 0;
		this.rightPlayer = 0;
		this.maxPoints = 1;
		this.round = 0;

		// Ball
		this.ballX = width / 2;
		this.ballY = height / 2;
		this.ballDia = 5;
		this.ballRadius = this.ballDia / 2;
		this.ballSpeedX = 3;
		this.ballSpeedY = 1;
		this.ballSpeedIncre = 1;
	}
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

var match = new Matchmaking();

function sendMessage(isServer, text)
{
	var leftName;
	var message = document.getElementById("message");
	var backgroundColor = "";
	if (!isServer)
	{
		if (message.value == "")
			return ;

		leftName = document.getElementById("playername1").value;
		if (leftName == "")
			leftName = "Player 1";
		message.value = leftName + " : " +  message.value;
	}
	else
	{
		message.value = text;
		backgroundColor = "rgb(255, 125, 125)";

	}
	//backgroundColor = "rgb(255, 125, 125)";
	var container = document.getElementById("scrollContainer");
	var label = document.createElement("label");
	var hr = document.createElement("hr");
	hr.style.width = "100%";
	label.innerHTML = message.value.replace(/\n/g, "<br>") + "<br>";
	label.style.backgroundColor = backgroundColor;
	label.style.padding = "2.5px";
	message.value = "";
	container.appendChild(label);
	container.appendChild(hr);
}

function displayImage(input)
{
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
	startGame(false, false);
}
function multiplayer()
{
	startGame(true, false);
}
function botplayer()
{
	startGame(false, true);
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



function startGame(Multiplayer, OnlyBot)
{
	var gameTime = new ElapsedTimer();
	var body = document.getElementById("body");
	body.style.margin = "-5";
	var table = document.getElementById("myFront");
	table.style.display = "none";
	var tableHeader = document.getElementById("tableHeader");
	tableHeader.style.display = "none";

	if (!OnlyBot)
	{
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
	}
	else
	{
		leftName = "Bot (Left)";
		rightName = "Bot (Right)";
	}

	let isRunning = true;

	const canvas = document.createElement("canvas");

	document.body.appendChild(canvas);

	canvas.style.width = "100vw - 8px";
	canvas.style.height = "100vh - 8px";
	canvas.style.margin = "0";
	canvas.style.borderRadius = "20px";
	const context = canvas.getContext("2d");

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

	var labelTimer = newElement("label", "bold", "calc(100vw - 98.5vw)", "fixed", "50%", "none", "25px", "none", "translate(-50%, -50%");
	labelTimer.textContent = "0 sec.";
	document.body.appendChild(labelTimer);

	var labelPunktestand = newElement("label", "bold", "calc(100vw - 98vw)", "fixed", "50%", "none", "65px", "none", "translate(-50%, -50%");
	labelPunktestand.textContent = "0 : 0";
	document.body.appendChild(labelPunktestand);

	var labelCountdownText = newElement("label", "bold", "calc(100vw - 98vw)", "fixed", "50%", "none", (canvas.offsetHeight * (100 - 60)) / 100 + "px", "none", "translate(-50%, -50%");
	labelCountdownText.textContent = "";
	document.body.appendChild(labelCountdownText);

	var labelCountdown = newElement("label", "bold", "calc(100vw - 98vw)", "fixed", "50%", "none", (canvas.offsetHeight * (100 - 50)) / 100 + "px", "none", "translate(-50%, -50%");
	labelCountdown.textContent = "";
	document.body.appendChild(labelCountdown);


	var labelLeftPlayer = newElement("label", "bold", "calc(100vw - 98.5vw)", "fixed", "20px","none", "20px", "none", "none");
	labelLeftPlayer.textContent = leftName;
	document.body.appendChild(labelLeftPlayer);

	var labelRightPlayer = newElement("label", "bold", "calc(100vw - 98.5vw)", "fixed", "none","20px", "20px", "none", "none");
	labelRightPlayer.textContent = rightName;
	document.body.appendChild(labelRightPlayer);

	var gameRules = new GameRules(canvas.height, canvas.width);

	function drawPaddle(x, y)
	{
		context.fillStyle = "#ffffff";
		context.fillRect(x, y, gameRules.paddleWidth, gameRules.paddleHeight);
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

	function addMatchToFrontEnd()
	{
		match.matches.push([]);
		var lastIndex = match.matches.length - 1;
		match.matches[lastIndex][0] = leftName;
		match.matches[lastIndex][1] = gameRules.leftPlayer;
		match.matches[lastIndex][2] = rightName;
		match.matches[lastIndex][3] = gameRules.rightPlayer;

		var matchRound = document.getElementById("matchRound");
		var matchLeft = document.getElementById("matchLeft");
		var matchRight = document.getElementById("matchRight");
		var matchScore = document.getElementById("matchScore");
		var matchTime = document.getElementById("matchTime");

		var label = document.createElement("label");
		var hr = document.createElement("hr");

		label.textContent = lastIndex + ".";
		matchRound.appendChild(label);
		matchRound.appendChild(hr);

		label = document.createElement("label");
		hr = document.createElement("hr");
		label.textContent = match.matches[lastIndex][0];
		matchLeft.appendChild(label);
		matchLeft.appendChild(hr);

		label = document.createElement("label");
		hr = document.createElement("hr");
		label.textContent = match.matches[lastIndex][2];
		matchRight.appendChild(label);
		matchRight.appendChild(hr);

		label = document.createElement("label");
		hr = document.createElement("hr");
		label.textContent = match.matches[lastIndex][1] + " : " + match.matches[lastIndex][3];
		matchScore.appendChild(label);
		matchScore.appendChild(hr);

		label = document.createElement("label");
		hr = document.createElement("hr");
		label.textContent = Math.floor(gameTime.getElapsedSeconds()) + "s";
		matchTime.appendChild(label);
		matchTime.appendChild(hr);
		if (gameRules.leftPlayer > gameRules.rightPlayer)
			sendMessage(true, "SERVER : " + leftName + " wins against " + rightName + " | " + gameRules.leftPlayer + " : " + gameRules.rightPlayer);
		else
			sendMessage(true, "SERVER : " + rightName + " wins against " + leftName + " | " + gameRules.rightPlayer + " : " + gameRules.leftPlayer);

	}

	function backToFrontEnd()
	{
		addMatchToFrontEnd();
		body.style.margin = "20";
		table.style.display = "";
		tableHeader.style.display = "";
		canvas.remove();
		labelRightPlayer.remove();
		labelLeftPlayer.remove();
		labelCountdown.remove();
		labelTimer.remove();
		labelCountdownText.remove();
		labelPunktestand.remove();
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

		if (gameRules.ballSpeedX > 0 && gameRules.ballX >= canvas.width / 2)
		{
			if (gameRules.rightPaddleY < gameRules.ballY - gameRules.paddleHeight / 2)
			gameRules.rightPaddleY++;
			else if (gameRules.rightPaddleY > gameRules.ballY - gameRules.paddleHeight / 2)
			gameRules.rightPaddleY--;
		}
		if (!OnlyBot)
			return;
		if (gameRules.ballSpeedX < 0 && gameRules.ballX <= canvas.width / 2)
		{
			if (gameRules.leftPaddleY < gameRules.ballY - gameRules.paddleHeight / 2)
			gameRules.leftPaddleY++;
			else if (gameRules.leftPaddleY > gameRules.ballY - gameRules.paddleHeight / 2)
			gameRules.leftPaddleY--;
		}
		if (gameRules.rightPaddleY < 0)
		gameRules.rightPaddleY = 0;
		else if (gameRules.rightPaddleY > canvas.height - gameRules.paddleHeight)
		gameRules.rightPaddleY = canvas.height - gameRules.paddleHeight;

		if (gameRules.leftPaddleY < 0)
		gameRules.leftPaddleY = 0;
		else if (gameRules.leftPaddleY > canvas.height - gameRules.paddleHeight)
		gameRules.leftPaddleY = canvas.height - gameRules.paddleHeight;
	}
	function updateGame() {

		if (!isRunning)
			return;
		labelTimer.textContent = Math.floor(gametimer.getElapsedSeconds()) + " sec.";
		if (OnlyBot)
			return;
		if (keysState["w"])
			gameRules.leftPaddleY--;
		if (keysState["s"])
			gameRules.leftPaddleY++;

		if (gameRules.leftPaddleY < 0)
			gameRules.leftPaddleY = 0;
		else if (gameRules.leftPaddleY > canvas.height - gameRules.paddleHeight)
			gameRules.leftPaddleY = canvas.height - gameRules.paddleHeight;

		if (Multiplayer == false)
			return ;
		if (keysState["ArrowUp"])
			gameRules.rightPaddleY--;
		if (keysState["ArrowDown"])
			gameRules.rightPaddleY++;

		if (gameRules.rightPaddleY < 0)
			gameRules.rightPaddleY = 0;
		else if (gameRules.rightPaddleY > canvas.height - gameRules.paddleHeight)
			gameRules.rightPaddleY = canvas.height - gameRules.paddleHeight;
	}

	const delay = ms => new Promise(res => setTimeout(res, ms));
	let updateGameID;
	let singleGameID;
	const resetGame = async () =>
	{
		gameRules.round++;
		context.fillStyle = "#000000";
		context.fillRect(0, 0, canvas.width, canvas.height);
		if (gameRules.round === 1)
			labelCountdownText.textContent = "Spiel startet...";
		else
			labelCountdownText.textContent = "Runde " + gameRules.round + " startet...";
		for (let i = 3; i > 0; i--)
		{
			labelCountdown.textContent = i;
			await delay(500);
		}
		labelCountdown.textContent = "";
		labelCountdownText.textContent = "";
		gameRules.ballX = canvas.width / 2;
		gameRules.ballY = canvas.height / 2;
		gameRules.leftPaddleY = (canvas.height - gameRules.paddleHeight) / 2;
		gameRules.rightPaddleY = (canvas.height - gameRules.paddleHeight) / 2;
		gameRules.ballSpeedY = 1;
		isRunning = true;
		gameRules.ballSpeedIncre = 1;
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
			if (gameRules.ballX < gameRules.paddleWidth)
			{
				gameRules.rightPlayer++;
				gameRules.ballSpeedX = -3;
			}
			else if (gameRules.ballX > canvas.width - gameRules.paddleWidth)
			{
				gameRules.leftPlayer++;
				gameRules.ballSpeedX = 3;
			}
			labelCountdownText.textContent = gameRules.leftPlayer === gameRules.maxPoints ? leftName + " hat gewonnen" : gameRules.rightPlayer === gameRules.maxPoints ? rightName + " hat gewonnen" : "";
			labelPunktestand.textContent = gameRules.leftPlayer + " : " + gameRules.rightPlayer;
			await delay(2500);
			if (gameRules.leftPlayer === gameRules.maxPoints || gameRules.rightPlayer === gameRules.maxPoints)
				return backToFrontEnd();
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
			//ballSpeedIncre += 0.1;
		}

	}

	function gameLoop()
	{

		if (isRunning)
		{
			gameRules.ballX += gameRules.ballSpeedX * gameRules.ballSpeedIncre;
			gameRules.ballY += gameRules.ballSpeedY * gameRules.ballSpeedIncre;

			if (gameRules.ballY < gameRules.ballDia || gameRules.ballY > canvas.height - gameRules.ballDia)
			gameRules.ballSpeedY = -gameRules.ballSpeedY;

			if ((gameRules.ballX < gameRules.paddleWidth + gameRules.ballDia && gameRules.ballY + gameRules.ballRadius > gameRules.leftPaddleY && gameRules.ballY - gameRules.ballRadius < gameRules.leftPaddleY + gameRules.paddleHeight) ||
				(gameRules.ballX > canvas.width - gameRules.paddleWidth - gameRules.ballDia && gameRules.ballY + gameRules.ballRadius > gameRules.rightPaddleY && gameRules.ballY - gameRules.ballRadius < gameRules.rightPaddleY + gameRules.paddleHeight))
				gameRules.ballSpeedX = -gameRules.ballSpeedX;

			if (gameRules.ballX + gameRules.ballRadius  < gameRules.paddleWidth || gameRules.ballX - gameRules.ballRadius > canvas.width - gameRules.paddleWidth)
				isRunning = false;

			context.fillStyle = "#000000";
			context.fillRect(0, 0, canvas.width, canvas.height);

			drawPaddle(1, gameRules.leftPaddleY);
			drawPaddle(canvas.width - gameRules.paddleWidth - 1, gameRules.rightPaddleY);
			drawBall(gameRules.ballX, gameRules.ballY);

			drawMiddle();
			requestAnimationFrame(gameLoop);
		}
		else
			checkStatus();

	}
	resetGame();
	gameTime.start();
}
// // oben
// drawDot(gameRules.ballX, gameRules.ballY - 2.5);
// // rechts
// drawDot(gameRules.ballX + 2.5, gameRules.ballY);
// // unten
// drawDot(gameRules.ballX, gameRules.ballY + 2.5);
// // links
// drawDot(gameRules.ballX - 2.5, gameRules.ballY);