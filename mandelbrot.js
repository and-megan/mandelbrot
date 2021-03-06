window.onload = () => {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  // Image Data (RGBA)
  const canvasData = context.createImageData(canvasWidth, canvasHeight);
  // Pan and zoom parameters
  let offsetX = -(canvasWidth / 2);
  let offsetY = -(canvasHeight / 2);
  let panX = -100;
  let panY = 0;
  let zoom = 200;
  const colors = [];
  // number of total iterations per pixel
  const maxIterations = 40;

  const startFractaling = () => {
    canvas.addEventListener("mousedown", mouseDownHandler);
    generateColors();
    generateImage();
    startLoop(0);
  }

  const startLoop = (tframe) => {
    window.requestAnimationFrame(startLoop);
    context.putImageData(canvasData, 0, 0);
  }

  const generateColors = () => {
    let redOffset = 0;
    let greenOffset = 20;
    let blueOffset = 100;

    for (let i = 0; i < 256; i++) {
      colors[i] = { r: redOffset, g: greenOffset, b: blueOffset };
      if (i < 64) {
        redOffset += 2;
      } else if (i < 128) {
        greenOffset += 3;
      } else if (i < 192) {
        blueOffset += 10;
      }
    }
  }

  const generateImage = () => {
    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        iterate(x, y, maxIterations);
      }
    }
  }

  // Calculate the color of a specific pixel
  const iterate = (x, y, maxIterations) => {
    // Convert the screen coordinate to a fractal coordinate
    let x0 = (x + offsetX + panX) / zoom;
    let y0 = (y + offsetY + panY) / zoom;
    let a = 0;
    let b = 0;
    let rx = 0;
    let ry = 0;

    let iterations = 0;
    while (iterations < maxIterations && (rx * rx + ry * ry <= 4)) {
      rx = a * a - b * b + x0;
      ry = 2 * a * b + y0;
      // Next iteration
      a = rx;
      b = ry;
      iterations++;
    }
    // color is based on number of current iterations
    let color;
    if (iterations == maxIterations) {
      color = { r: 0, g: 3, b: 61 }; // Dark blue for middle
    } else {
      let index = Math.floor((iterations / (maxIterations - 1)) * 255);
      color = colors[index];
    }

    // color the pixel
    let pixelIndex = (y * canvasWidth + x) * 4;
    canvasData.data[pixelIndex] = color.r;
    canvasData.data[pixelIndex + 1] = color.g;
    canvasData.data[pixelIndex + 2] = color.b;
    canvasData.data[pixelIndex + 3] = 255;
  }

  const zoomInOnFractal = (x, y, multiplier, zoomIn) => {
    if (zoomIn) {
      zoom *= multiplier;
      panX = multiplier * (x + offsetX + panX);
      panY = multiplier * (y + offsetY + panY);
    } else {
      zoom /= multiplier;
      panX = (x + offsetX + panX) / multiplier;
      panY = (y + offsetY + panY) / multiplier;
    }
  }

  // Mouse event handlers
  const mouseDownHandler = (e) => {
    const pos = getMouseDownPosition(canvas, e);
    // zoom out with ctrl
    let zoomIn = true;
    if (e.ctrlKey) {
      zoomIn = false;
    }
    // zoom in
    let zoomMultiplier = 2;
    if (e.shiftKey) {
      // don't zoom, only shift
      zoomMultiplier = 1;
    }
    zoomInOnFractal(pos.x, pos.y, zoomMultiplier, zoomIn);
    generateImage();
  }

  const getMouseDownPosition = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.round((e.clientX - rect.left)/(rect.right - rect.left)*canvas.width),
      y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
    };
  }

  startFractaling();
};
