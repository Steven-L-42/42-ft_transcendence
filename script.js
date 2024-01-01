document.getElementById("startgame").addEventListener("click", startGame);

function startGame() {
    var test = document.getElementById("table");
    test.style.display = "none";

    var leftName = document.getElementById("playername1").value;
    if (leftName == "")
        leftName = "Player 1";
    var rightName = document.getElementById("playername2").value;
    if (rightName == "")
        rightName = "Player 2";
    let isRunning = true;

    const canvas = document.createElement("canvas");

    document.body.appendChild(canvas);

    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.margin = "-8px 0 0 -8px";
    const context = canvas.getContext("2d");

    var labelPunktestand = document.createElement("label");
    {
        labelPunktestand.textContent = "0 : 0";
        labelPunktestand.style.fontWeight = "bold";
        labelPunktestand.style.fontSize = "50px";
        labelPunktestand.style.position = "fixed";
        labelPunktestand.style.left = "50%";
        labelPunktestand.style.top = "50px";
        labelPunktestand.style.transform = "translate(-50%, -50%)";
        document.body.appendChild(labelPunktestand);
    }

    var labelCountdown = document.createElement("label");
    { 
        labelCountdown.textContent = "";
        labelCountdown.style.fontWeight = "bold";
        labelCountdown.style.fontSize = "50px";
        labelCountdown.style.position = "fixed";
        labelCountdown.style.left = "50%";
        labelCountdown.style.top = "50%";
        labelCountdown.style.transform = "translate(-50%, -50%)";
        document.body.appendChild(labelCountdown);
    }

    var labelLeftPlayer = document.createElement("label");
    {
        labelLeftPlayer.textContent = leftName;
        labelLeftPlayer.style.fontWeight = "bold";
        labelLeftPlayer.style.fontSize = "25px";
        labelLeftPlayer.style.position = "fixed";
        labelLeftPlayer.style.left = "10px";
        labelLeftPlayer.style.top = "10px";
        document.body.appendChild(labelLeftPlayer);
    }

    var labelRightPlayer = document.createElement("label");
    {
        labelRightPlayer.textContent = rightName;
        labelRightPlayer.style.fontWeight = "bold";
        labelRightPlayer.style.fontSize = "25px";
        labelRightPlayer.style.position = "fixed";
        labelRightPlayer.style.right = "10px";
        labelRightPlayer.style.top = "10px";
        document.body.appendChild(labelRightPlayer);
    }


    // Schläger
    const paddleWidth = 5, paddleHeight = 60;
    let leftPaddleY = (canvas.height - paddleHeight) / 2;
    let rightPaddleY = (canvas.height - paddleHeight) / 2;

    // Punktzahl
    let leftPlayer = 0;
    let rightPlayer = 0;
    let maxPoints = 5;

    // Ball
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 3, ballSpeedY = 1;

    function drawPaddle(x, y) {
        context.fillStyle = "#ffffff";
        context.fillRect(x, y, paddleWidth, paddleHeight);
    }

    function drawBall(x, y) {
        context.fillStyle = "#ffffff";
        context.beginPath();
        context.arc(x, y, 4, 0, Math.PI * 2, false);
        context.fill();
    }
    const keysState =
    {
        w: false,
        s: false,
        ArrowUp: false,
        ArrowDown: false,
    };

    document.addEventListener("keydown", function (event) {
        const key = event.key;

        if (keysState.hasOwnProperty(key)) {
            keysState[key] = true;
        }
    });

    document.addEventListener("keyup", function (event) {
        const key = event.key;

        if (keysState.hasOwnProperty(key)) {
            keysState[key] = false;
        }
    });

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
    }

    const delay = ms => new Promise(res => setTimeout(res, ms));

    const resetGame = async () => {
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);
        labelPunktestand.textContent = "Spiel startet";
        for (let i = 3; i > 0; i--) {
            labelCountdown.textContent = i;
            await delay(1000);
        }
        labelCountdown.textContent = "";
        labelPunktestand.textContent = leftPlayer + " : " + rightPlayer;
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        leftPaddleY = (canvas.height - paddleHeight) / 2;
        rightPaddleY = (canvas.height - paddleHeight) / 2;
        ballSpeedY = 1;
        isRunning = true;
        gameLoop();
    }

    const checkStatus = async () => {
        if (!isRunning) {
            if (ballX < paddleWidth) {
                rightPlayer++;
                ballSpeedX = -3;
            }
            else if (ballX > canvas.width - paddleWidth) {
                leftPlayer++;
                ballSpeedX = 3;
            }

            labelPunktestand.textContent = leftPlayer === maxPoints ? leftName + " hat gewonnen" : rightPlayer === maxPoints ? rightName + " hat gewonnen" : leftPlayer + " : " + rightPlayer;

            await delay(2500);
            if (leftPlayer === maxPoints || rightPlayer === maxPoints)
                return;
            await resetGame();
        }
    }

    setInterval(updateGame, 1000 / 120);

    // Hauptspiel-Loop
    function gameLoop() {

        if (isRunning) {

            ballX += ballSpeedX;
            ballY += ballSpeedY;

            if (ballY < 0 || ballY > canvas.height)
                ballSpeedY = -ballSpeedY;


            if ((ballX < paddleWidth * 2 && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) ||
                (ballX > canvas.width - paddleWidth * 2 && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight))
                ballSpeedX = -ballSpeedX;

            if (ballX < paddleWidth || ballX > canvas.width - paddleWidth)
                isRunning = false;

            context.fillStyle = "#000000";
            context.fillRect(0, 0, canvas.width, canvas.height);

            drawPaddle(1, leftPaddleY);
            drawPaddle(canvas.width - paddleWidth - 1, rightPaddleY);
            drawBall(ballX, ballY);

            requestAnimationFrame(gameLoop);
        }
        else
            checkStatus();

    }
    resetGame();

}