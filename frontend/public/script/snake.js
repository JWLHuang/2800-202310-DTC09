const snakeGame = () => {
    // Initialize the canvas and game variables
    const canvas = document.getElementById("gameCanvas");
    const context = canvas.getContext("2d");
    const boxSize = 15;
    const canvasSize = 300;
    const snake = [{
        x: 150,
        y: 150
    }];

    let food = {
        x: 0,
        y: 0
    };
    let direction = "right";
    let score = 0;

    // Generate random coordinates for the food
    function generateFood() {
        food = {
            x: Math.floor(Math.random() * (canvasSize / boxSize)) * boxSize,
            y: Math.floor(Math.random() * (canvasSize / boxSize)) * boxSize,
        };
    }

    // Update game state
    function update() {
        // Move the snake
        const head = {
            x: snake[0].x,
            y: snake[0].y
        };

        switch (direction) {
            case "up":
                head.y -= boxSize;
                break;
            case "down":
                head.y += boxSize;
                break;
            case "left":
                head.x -= boxSize;
                break;
            case "right":
                head.x += boxSize;
                break;
        }

        // Check collision with the wall or itself
        if (
            head.x < 0 ||
            head.y < 0 ||
            head.x >= canvasSize ||
            head.y >= canvasSize ||
            checkCollision(head, snake)
        ) {
            clearInterval(gameLoop);
            alert("Game Over! Your score: " + score);

            // Reset the game
            document.getElementById("mainScreen").innerHTML = `
            <div id="introScreen">
                <h2><em>Chasing Stars</em></h2>
                <br />
                <button id="startGame" class="startButton">Start game</button>
            </div>
            `;

            document.getElementById("startGame")
                .addEventListener("click", () => {
                    document.getElementById("mainScreen").innerHTML = `
                    <canvas id="gameCanvas" width="300" height="300"></canvas>`;
                    snakeGame();
                });

            return;
        }

        // Check collision with food
        if (head.x === food.x && head.y === food.y) {
            score++;
            generateFood();
        } else {
            // Remove the tail segment
            snake.pop();
        }

        // Add the new head to the snake
        snake.unshift(head);

        // Clear the canvas
        context.clearRect(0, 0, canvasSize, canvasSize);

        // Draw the snake
        snake.forEach((segment, index) => {
            if (index === 0) {
                // Draw the head of the snake
                drawMichelinManHead(segment.x, segment.y, boxSize);
            } else {
                // Draw the body segment of the snake
                drawStar(segment.x + boxSize / 2, segment.y + boxSize / 2, 5, boxSize / 2, boxSize / 4);
            }
        });

        // Draw the food
        context.fillStyle = "yellow";
        drawStar(food.x + boxSize / 2, food.y + boxSize / 2, 5, boxSize / 2, boxSize / 4);


        // Draw the score
        context.fillStyle = "black";
        context.font = "20px Arial";
        context.fillText("Score: " + score, 10, 30);
    }

    // Check if the snake collides with itself
    function checkCollision(head, snake) {
        return snake.some((segment) => segment.x === head.x && segment.y === head.y);
    }

    // Draw a star shape
    function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        context.beginPath();
        context.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            context.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            context.lineTo(x, y);
            rot += step;
        }
        context.lineTo(cx, cy - outerRadius);
        context.closePath();
        context.lineWidth = 2;
        context.strokeStyle = "black";
        context.fillStyle = "yellow";
        context.stroke();
        context.fill();
    }

    // Draw a Michelin Man head with rounded rectangle outline
    function drawMichelinManHead(x, y, size) {
        const outlineWidth = 2; // Adjust the outline width
        const topCornerRadius = size / 5; // Adjust the top corner radius
        const bottomCornerRadius = size / 10; // Adjust the bottom corner radius

        // Draw the head
        context.fillStyle = "white";
        context.beginPath();
        context.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        context.closePath();
        context.fill();

        // Draw the outline
        context.strokeStyle = "black";
        context.lineWidth = outlineWidth;
        context.beginPath();
        context.moveTo(x + topCornerRadius, y);
        context.lineTo(x + size - topCornerRadius, y);
        context.arcTo(x + size, y, x + size, y + topCornerRadius, topCornerRadius);
        context.lineTo(x + size, y + size - bottomCornerRadius);
        context.arcTo(x + size, y + size, x + size - bottomCornerRadius, y + size, bottomCornerRadius);
        context.lineTo(x + bottomCornerRadius, y + size);
        context.arcTo(x, y + size, x, y + size - bottomCornerRadius, bottomCornerRadius);
        context.lineTo(x, y + topCornerRadius);
        context.arcTo(x, y, x + topCornerRadius, y, topCornerRadius);
        context.closePath();
        context.stroke();

        // Draw the inner details
        context.fillStyle = "white";
        context.beginPath();
        context.arc(x + size / 2, y + size / 2, size / 4, 0, Math.PI * 2);
        context.closePath();
        context.fill();

        context.fillStyle = "white";
        context.beginPath();
        context.arc(x + size / 2, y + size / 2, size / 8, 0, Math.PI * 2);
        context.closePath();
        context.fill();

        context.fillStyle = "black";
        context.beginPath();
        context.arc(x + size / 3, y + size / 3, size / 12, 0, Math.PI * 2);
        context.closePath();
        context.fill();

        context.fillStyle = "black";
        context.beginPath();
        context.arc(x + (2 * size) / 3, y + size / 3, size / 12, 0, Math.PI * 2);
        context.closePath();
        context.fill();

        context.fillStyle = "black";
        context.beginPath();
        context.arc(x + size / 2, y + (3 * size) / 5, size / 8, 0, Math.PI);
        context.closePath();
        context.fill();
    }

    // Add event listeners for button controls
    document.getElementById("upButton").addEventListener("click", () => {
        if (direction !== "down") {
            direction = "up";
        }
    });

    document.getElementById("leftButton").addEventListener("click", () => {
        if (direction !== "right") {
            direction = "left";
        }
    });

    document.getElementById("rightButton").addEventListener("click", () => {
        if (direction !== "left") {
            direction = "right";
        }
    });

    document.getElementById("downButton").addEventListener("click", () => {
        if (direction !== "up") {
            direction = "down";
        }
    });

    // Handle keyboard events to change snake direction
    document.addEventListener("keydown", changeDirection);

    function changeDirection(event) {
        const keyPressed = event.keyCode;

        switch (keyPressed) {
            case 37: // Left arrow key
                if (direction !== "right") {
                    direction = "left";
                }
                break;
            case 38: // Up arrow key
                if (direction !== "down") {
                    direction = "up";
                }
                break;
            case 39: // Right arrow key
                if (direction !== "left") {
                    direction = "right";
                }
                break;
            case 40: // Down arrow key
                if (direction !== "up") {
                    direction = "down";
                }
                break;
        }
    }

    // Start the game loop
    const gameLoop = setInterval(update, 150);

    // Generate initial food
    generateFood();
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("startGame")
        .addEventListener("click", () => {
            document.getElementById("mainScreen").innerHTML = `
                <canvas id="gameCanvas" width="300" height="300"></canvas>`;
            snakeGame();
        });
});
