const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let canvasWidth = 1000;
let canvasHeight = 400;
const originalAspectRatio = canvasWidth / canvasHeight;
let centerX = canvasWidth / 2;
let centerY = canvasHeight / 2;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let isSymmetric = false;
let mirrorPoints = 9; // Starting mirrors set to 9
let selectedColor = 'black'; // Default color
let selectedLineWidth = 5; // Default line width
let selectedBrushType = "Medium"; // Added a variable to keep track of the selected brush type
let isErasing = false; //flag to know if we are in eraser mode
let eraserWidth = 20;//width of the eraser

function updateCanvasSize() {
    canvasWidth = canvasContainer.offsetWidth;
    canvasHeight = canvasWidth / originalAspectRatio;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    centerX = canvasWidth / 2;
    centerY = canvasHeight / 2;
    ctx.strokeStyle = selectedColor; // Set the drawing color
    ctx.lineWidth = selectedLineWidth; //set the line width
}

function drawSymmetricLine(x1, y1, x2, y2, mirrorPoint) {
    // ...code for drawing symetrical lines...
    ctx.strokeStyle = selectedColor; // Set the drawing color
    ctx.lineWidth = selectedLineWidth; //set the line width
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    if(isSymmetric){
        const angle = (2 * Math.PI) / mirrorPoints;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const dx = x2 - centerX;
        const dy = y2 - centerY;
    
        for (let i = 1; i < mirrorPoints; i++) {
            const rotatedX = dx * Math.cos(angle * i) - dy * Math.sin(angle * i);
            const rotatedY = dx * Math.sin(angle * i) + dy * Math.cos(angle * i);
    
            ctx.beginPath();
            ctx.moveTo(centerX + rotatedX, centerY + rotatedY);
            ctx.lineTo(centerX + rotatedX * (x2 - x1), centerY + rotatedY * (y2 - y1));
            ctx.stroke();
        }
    }
}

function clearCanvas() {
    //code to clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function changeToBrush(){
    //code to change to brush mode
    isErasing = false; //disable eraser
    document.getElementById('eraser').classList.remove('active'); //set the button to inactive
    document.getElementById('brush').classList.add('active'); //set the button to active
}

function changeToEraser(){
    //code to change to eraser mode
    isErasing = true; //enable eraser
    document.getElementById('brush').classList.remove('active'); //set the button to inactive
    document.getElementById('eraser').classList.add('active'); //set the button to active
}

function draw(event) {
    if (isDrawing) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        let rect = canvas.getBoundingClientRect();
        let currentX = event.clientX - rect.left;
        let currentY = event.clientY - rect.top;
        ctx.lineTo(currentX, currentY);
        if (isErasing) {
            ctx.globalCompositeOperation = 'destination-out'; // Set composite operation to erase
            ctx.strokeStyle = `rgba(0,0,0,1)`; //make the eraser always black
            ctx.lineWidth = eraserWidth;
        } else {
            ctx.globalCompositeOperation = 'source-over'; // Reset composite operation
            ctx.strokeStyle = selectedColor; // Set the drawing color
            ctx.lineWidth = selectedLineWidth; //set the line width
        }
        ctx.stroke();
        drawSymmetricLine(lastX, lastY, currentX, currentY, mirrorPoints)
        lastX = currentX;
        lastY = currentY;
    }
    
}

function addTouchListeners() {
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        lastX = touch.clientX - rect.left;
        lastY = touch.clientY - rect.top;
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        if (isErasing) {
            ctx.globalCompositeOperation = 'destination-out'; // Set composite operation to erase
            ctx.strokeStyle = `rgba(0,0,0,1)`; //make the eraser always black
            ctx.lineWidth = eraserWidth;
        } else {
            ctx.globalCompositeOperation = 'source-over'; // Reset composite operation
            ctx.strokeStyle = selectedColor; // Set the drawing color
            ctx.lineWidth = selectedLineWidth; //set the line width
        }
        ctx.stroke();
        drawSymmetricLine(lastX, lastY, currentX, currentY, mirrorPoints);
        lastX = currentX;
        lastY = currentY;
    }, { passive: true });

    canvas.addEventListener('touchend', () => {
        isDrawing = false;
    }, { passive: true });
}

canvas.addEventListener('mousedown', (event) => {
    isDrawing = true;
    [lastX, lastY] = [event.offsetX, event.offsetY];
});

canvas.addEventListener('mousemove', draw);

canvas.addEventListener('mouseup', () => isDrawing = false);

canvas.addEventListener('mouseout', () => isDrawing = false);

addTouchListeners();

window.addEventListener('resize', updateCanvasSize);

updateCanvasSize();
// Add Background Dropdown functionality
var backgroundDropdown = document.getElementById('background-dropdown');

backgroundDropdown.addEventListener('change', function () {
    var selectedBackground = backgroundDropdown.value;
    canvasContainer.style.backgroundImage = 'url("' + selectedBackground + '")';
});
// Add Background Dropdown functionality
var backgroundDropdown = document.getElementById('background-dropdown');
var canvasContainer = document.querySelector('#canvasContainer');
//add the line below to set the default image.
canvasContainer.style.backgroundImage = 'url("../images/your-background-image.svg")';

backgroundDropdown.addEventListener('change', function () {
    var selectedBackground = backgroundDropdown.value;
    canvasContainer.style.backgroundImage = 'url("' + selectedBackground + '")';
});
