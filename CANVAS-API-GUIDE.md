# Canvas API Advanced Guide

## Canvas Context Configuration

### Getting 2D Context
```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
// Optionally, for better performance:
const ctx = canvas.getContext('2d', { willReadFrequently: true });
```

### Canvas Sizing
```javascript
// Physical pixels (affects rendering quality)
canvas.width = 800;
canvas.height = 600;

// CSS size (affects display size)
canvas.style.width = '800px';
canvas.style.height = '600px';

// IMPORTANT: Setting canvas.width/height clears the canvas!
// Use CSS size for responsive without clearing
```

## Image Data Manipulation

### Getting Pixel Data
```javascript
const imageData = ctx.getImageData(x, y, width, height);
const data = imageData.data;  // Uint8ClampedArray

// Format: [R0, G0, B0, A0, R1, G1, B1, A1, ...]
// Each value: 0-255
// Alpha = 255 (fully opaque) to 0 (fully transparent)
```

### Modifying Pixels - Greyscale Example
```javascript
for (let i = 0; i < data.length; i += 4) {
  const r = data[i];      // Red channel
  const g = data[i + 1];  // Green channel
  const b = data[i + 2];  // Blue channel
  // data[i + 3] is Alpha, usually skip for color filters
  
  // ITU-R BT.601 luminance formula
  const grey = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  
  // Set all channels to grey value
  data[i] = grey;         // Red
  data[i + 1] = grey;     // Green  
  data[i + 2] = grey;     // Blue
  // Keep original alpha: data[i + 3] unchanged
}

ctx.putImageData(imageData, 0, 0);
```

### Uint8ClampedArray Behavior
- Values automatically clamp: 256 becomes 255, -1 becomes 0
- No manual clamping needed with Math.min/max
- Performance optimized for pixel data

## Real-Time Video Processing

### Video to Canvas Capture
```javascript
// Ensure canvas size matches video dimensions
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

// Draw current video frame
ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

// Now canvas contains the captured frame - can apply filters
```

### Why This Works
- `video.videoWidth/videoHeight` are readable even while playing
- `drawImage()` grabs the current frame buffer
- Can be called continuously in requestAnimationFrame loop

## MediaDevices API Details

### getUserMedia Constraints
```javascript
const constraints = {
  video: {
    width: { ideal: 1280 },      // "ideal" never fails, just tries
    height: { ideal: 720 },
    facingMode: 'user'           // 'user' for front camera
    // facingMode: 'environment'  // rear camera on mobile
  },
  audio: false  // No audio in this project
};

const stream = await navigator.mediaDevices.getUserMedia(constraints);
video.srcObject = stream;  // Not video.src!
```

### Error Handling
```javascript
try {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
} catch (error) {
  if (error.name === 'NotAllowedError') {
    // User denied permission
  } else if (error.name === 'NotFoundError') {
    // No device found
  } else if (error.name === 'NotReadableError') {
    // Device in use/permission issue
  } else if (error.name === 'PermissionDeniedError') {
    // Permission request was denied
  } else if (error.name === 'TypeError') {
    // Constraints are invalid
  }
}
```

### Stopping the Stream
```javascript
mediaStream.getTracks().forEach(track => {
  track.stop();  // Stop each track (audio, video, etc.)
});
videoElement.srcObject = null;
```

## Common Canvas Operations

### Drawing Shapes
```javascript
// Rectangle
ctx.fillRect(x, y, width, height);

// Circle/Arc
ctx.arc(centerX, centerY, radius, startAngle, endAngle);
ctx.fill();

// Line
ctx.moveTo(x1, y1);
ctx.lineTo(x2, y2);
ctx.stroke();
```

### Setting Colors and Styles
```javascript
ctx.fillStyle = '#FF0000';     // Color
ctx.fillStyle = 'rgb(255, 0, 0)';
ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';  // With alpha

ctx.strokeStyle = '#0000FF';   // Border color
ctx.lineWidth = 2;             // Line thickness
```

### Clearing Canvas
```javascript
ctx.clearRect(0, 0, canvas.width, canvas.height);
// OR: canvas.width = canvas.width;  (clears via reassignment)
```

## Performance Optimization

### Batch Operations
```javascript
// SLOW: Multiple imageData operations
for (let i = 0; i < 10; i++) {
  const imageData = ctx.getImageData(...);
  // ... modify ...
  ctx.putImageData(imageData, ...);
}

// FAST: Single read, multiple modifications
const imageData = ctx.getImageData(0, 0, w, h);
const data = imageData.data;
for (let pass = 0; pass < 10; pass++) {
  for (let i = 0; i < data.length; i++) {
    // multiple operations on same data
  }
}
ctx.putImageData(imageData, 0, 0);
```

### RequestAnimationFrame for Continuous Updates
```javascript
function animate() {
  // Process frame
  ctx.drawImage(video, 0, 0);
  applyFilters();
  
  // Request next frame (browser optimizes timing)
  requestAnimationFrame(animate);
}

// Start animation
requestAnimationFrame(animate);
```

## Canvas-Based Visualization

### Frequency Spectrum Display (from Web Audio Analyser)
```javascript
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;

function drawSpectrum() {
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);
  
  const width = canvas.width;
  const height = canvas.height;
  const barWidth = width / dataArray.length;
  
  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.fillRect(0, 0, width, height);  // Clear
  
  ctx.fillStyle = 'rgb(100, 150, 255)';
  for (let i = 0; i < dataArray.length; i++) {
    const bar Height = (dataArray[i] / 255) * height;
    ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
  }
  
  requestAnimationFrame(drawSpectrum);
}
```

## Browser Support & Limitations

### Canvas API Support
- Chrome/Firefox/Safari/Edge: Full support
- IE 11: Limited support (basic shapes only)
- Mobile browsers: Full support (performance varies)

### Known Issues
- Canvas pixel data is read in RGBA order (not BGR)
- Large canvases (4K+) can consume significant GPU memory
- Continuous getImageData() can be slow (use willReadFrequently)

## References

- MDN Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- MDN MediaDevices API: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices
- W3C Canvas Specification: https://html.spec.whatwg.org/multipage/canvas.html
- "Digital Image Processing" - Gonzalez & Woods
