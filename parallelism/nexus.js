    <script>
        // Global variables
        let scene, camera, renderer, particleSystem;
        let mandalaCanvas, mandalaCtx, threeCanvas;
        let currentMode = 'mandala';
        let isDrawing = false;
        let lastX = 0, lastY = 0;
        let audioEnabled = false;
        let synth, reverb;
        let artCount = 0;
        let potentialRevenue = 0;
        let stripe; // Stripe instance
        
        // Mandala settings
        let mandalaColor = '#ff0066';
        let brushSize = 8;
        let symmetryPoints = 8;
        let symmetryEnabled = true;
        
        // Particle settings
        let particleParams = {
            startColor: new THREE.Color('#ff0000'),
            endColor: new THREE.Color('#00ff00'),
            size: 4,
            gravity: -0.5,
            wind: 1,
            emissionRate: 60,
            particles: []
        };
        
        // Initialize Stripe
        function initializeStripe() {
            // In production, use your actual publishable key
            // For demo purposes, we'll simulate the payment flow
            console.log('Stripe would be initialized here with your publishable key');
        }
        
        // Initialize everything
        function init() {
            setupCanvases();
            setupThreeJS();
            setupEventListeners();
            setupAudio();
            initializeStripe();
            
            // Start with mandala mode
            setMode('mandala');
            updateRevenue();
        }
        
        function setupCanvases() {
            mandalaCanvas = document.getElementById('mandalaCanvas');
            mandalaCtx = mandalaCanvas.getContext('2d');
            
            // Set canvas size to window
            mandalaCanvas.width = window.innerWidth;
            mandalaCanvas.height = window.innerHeight;
            
            // Make canvas transparent for particles underneath
            mandalaCanvas.style.background = 'transparent';
        }
        
        function setupThreeJS() {
            // Scene setup
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 10;
            
            // Renderer
            renderer = new THREE.WebGLRenderer({ 
                alpha: true, 
                antialias: true,
                preserveDrawingBuffer: true // Important for screenshots
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0x000000, 0); // Transparent background
            
            document.getElementById('threeCanvas').appendChild(renderer.domElement);
            
            // Create particle system
            createParticleSystem();
            
            // Animation loop
            animate();
        }
        
        function createParticleSystem() {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(2000 * 3); // Increased particle count
            const colors = new Float32Array(2000 * 3);
            const sizes = new Float32Array(2000);
            
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
            
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    pointTexture: { value: createParticleTexture() }
                },
                vertexShader: `
                    attribute float size;
                    varying vec3 vColor;
                    void main() {
                        vColor = color;
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = size * (300.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    uniform sampler2D pointTexture;
                    varying vec3 vColor;
                    void main() {
                        gl_FragColor = vec4(vColor, 1.0);
                        gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
                        if (gl_FragColor.a < 0.1) discard;
                    }
                `,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true,
                vertexColors: true
            });
            
            particleSystem = new THREE.Points(geometry, material);
            scene.add(particleSystem);
        }
        
        function createParticleTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const context = canvas.getContext('2d');
            
            const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            
            context.fillStyle = gradient;
            context.fillRect(0, 0, 64, 64);
            
            return new THREE.CanvasTexture(canvas);
        }
        
        async function setupAudio() {
            document.getElementById('startButton').addEventListener('click', async () => {
                try {
                    await Tone.start();
                    audioEnabled = true;
                    
                    synth = new Tone.Synth({
                        oscillator: { type: "sine" },
                        envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 1 }
                    }).toDestination();
                    
                    reverb = new Tone.Reverb(2).toDestination();
                    synth.connect(reverb);
                    
                    document.getElementById('startButton').style.display = 'none';
                } catch (error) {
                    console.log('Audio setup failed, continuing without audio');
                    document.getElementById('startButton').style.display = 'none';
                }
            });
        }
        
        function setupEventListeners() {
            // Mode buttons
            document.getElementById('mandalaMode').addEventListener('click', () => setMode('mandala'));
            document.getElementById('particleMode').addEventListener('click', () => setMode('particle'));
            document.getElementById('combinedMode').addEventListener('click', () => setMode('combined'));
            
            // Canvas events with improved touch handling
            mandalaCanvas.addEventListener('mousedown', startDrawing);
            mandalaCanvas.addEventListener('mousemove', draw);
            mandalaCanvas.addEventListener('mouseup', stopDrawing);
            mandalaCanvas.addEventListener('mouseout', stopDrawing);
            
            // Enhanced touch events
            mandalaCanvas.addEventListener('touchstart', handleTouch, { passive: false });
            mandalaCanvas.addEventListener('touchmove', handleTouch, { passive: false });
            mandalaCanvas.addEventListener('touchend', stopDrawing, { passive: false });
            
            // Control events
            document.getElementById('mandalaColor').addEventListener('input', (e) => {
                mandalaColor = e.target.value;
            });
            
            document.getElementById('brushSize').addEventListener('input', (e) => {
                brushSize = parseInt(e.target.value);
                document.getElementById('brushSizeValue').textContent = brushSize;
            });
            
            document.getElementById('symmetryPoints').addEventListener('input', (e) => {
                symmetryPoints = parseInt(e.target.value);
                document.getElementById('symmetryValue').textContent = symmetryPoints;
            });
            
            document.getElementById('symmetryToggle').addEventListener('change', (e) => {
                symmetryEnabled = e.target.checked;
            });
            
            // Particle controls
            document.getElementById('particleStartColor').addEventListener('input', (e) => {
                particleParams.startColor = new THREE.Color(e.target.value);
            });
            
            document.getElementById('particleEndColor').addEventListener('input', (e) => {
                particleParams.endColor = new THREE.Color(e.target.value);
            });
            
            document.getElementById('particleSize').addEventListener('input', (e) => {
                particleParams.size = parseFloat(e.target.value);
                document.getElementById('particleSizeValue').textContent = particleParams.size;
            });
            
            document.getElementById('gravity').addEventListener('input', (e) => {
                particleParams.gravity = parseFloat(e.target.value);
                document.getElementById('gravityValue').textContent = particleParams.gravity;
            });
            
            document.getElementById('windForce').addEventListener('input', (e) => {
                particleParams.wind = parseFloat(e.target.value);
                document.getElementById('windValue').textContent = particleParams.wind;
            });
            
            document.getElementById('emissionRate').addEventListener('input', (e) => {
                particleParams.emissionRate = parseInt(e.target.value);
                document.getElementById('emissionValue').textContent = particleParams.emissionRate;
            });
            
            // Action buttons
            document.getElementById('clearAll').addEventListener('click', clearAll);
            document.getElementById('clearMandala').addEventListener('click', clearMandala);
            document.getElementById('clearParticles').addEventListener('click', clearParticles);
            
            // Export buttons
            document.getElementById('previewExport').addEventListener('click', previewExport);
            document.getElementById('paymentButton').addEventListener('click', handlePayment);
            document.getElementById('freeDownload').addEventListener('click', freeDownload);
            
            // Window resize
            window.addEventListener('resize', onWindowResize);
        }
        
        function setMode(mode) {
            currentMode = mode;
            
            // Update button states
            document.querySelectorAll('.mode-buttons button, #combinedMode').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show/hide controls
            const mandalaControls = document.getElementById('mandalaControls');
            const particleControls = document.getElementById('particleControls');
            
            switch(mode) {
                case 'mandala':
                    document.getElementById('mandalaMode').classList.add('active');
                    mandalaControls.style.display = 'block';
                    particleControls.style.display = 'none';
                    mandalaCanvas.style.pointerEvents = 'auto';
                    break;
                case 'particle':
                    document.getElementById('particleMode').classList.add('active');
                    mandalaControls.style.display = 'none';
                    particleControls.style.display = 'block';
                    mandalaCanvas.style.pointerEvents = 'auto';
                    break;
                case 'combined':
                    document.getElementById('combinedMode').classList.add('active');
                    mandalaControls.style.display = 'block';
                    particleControls.style.display = 'block';
                    mandalaCanvas.style.pointerEvents = 'auto';
                    break;
            }
        }
        
        function handleTouch(e) {
            e.preventDefault();
            const touch = e.touches[0] || e.changedTouches[0];
            if (!touch) return;
            
            const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                            e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            mandalaCanvas.dispatchEvent(mouseEvent);
        }
        
        function getMousePos(e) {
            const rect = mandalaCanvas.getBoundingClientRect();
            return {
                x: (e.clientX - rect.left) * (mandalaCanvas.width / rect.width),
                y: (e.clientY - rect.top) * (mandalaCanvas.height / rect.height)
            };
        }
        
        function startDrawing(e) {
            // Skip if clicking on controls
            if (e.target.closest('.controls')) return;
            
            isDrawing = true;
            const pos = getMousePos(e);
            lastX = pos.x;
            lastY = pos.y;
            
            // Start continuous audio
            startContinuousAudio();
            
            // Track art creation
            updateArtProgress();
        }
        
        function draw(e) {
            if (!isDrawing) return;
            
            const pos = getMousePos(e);
            
            if (currentMode === 'mandala' || currentMode === 'combined') {
                drawMandala(pos.x, pos.y);
            }
            
            if (currentMode === 'particle' || currentMode === 'combined') {
                emitParticles(pos.x, pos.y);
            }
            
            // Continue audio during drawing with musical variation
            updateContinuousAudio(pos.x, pos.y);
            
            lastX = pos.x;
            lastY = pos.y;
        }
        
        function drawMandala(x, y) {
            mandalaCtx.strokeStyle = mandalaColor;
            mandalaCtx.lineWidth = brushSize;
            mandalaCtx.lineCap = 'round';
            mandalaCtx.lineJoin = 'round';
            
            if (symmetryEnabled) {
                const centerX = mandalaCanvas.width / 2;
                const centerY = mandalaCanvas.height / 2;
                const angleStep = (2 * Math.PI) / symmetryPoints;
                
                for (let i = 0; i < symmetryPoints; i++) {
                    const angle = i * angleStep;
                    
                    const dx = x - centerX;
                    const dy = y - centerY;
                    const rotatedX = centerX + dx * Math.cos(angle) - dy * Math.sin(angle);
                    const rotatedY = centerY + dx * Math.sin(angle) + dy * Math.cos(angle);
                    
                    const lastDx = lastX - centerX;
                    const lastDy = lastY - centerY;
                    const rotatedLastX = centerX + lastDx * Math.cos(angle) - lastDy * Math.sin(angle);
                    const rotatedLastY = centerY + lastDx * Math.sin(angle) + lastDy * Math.cos(angle);
                    
                    mandalaCtx.beginPath();
                    mandalaCtx.moveTo(rotatedLastX, rotatedLastY);
                    mandalaCtx.lineTo(rotatedX, rotatedY);
                    mandalaCtx.stroke();
                }
            } else {
                mandalaCtx.beginPath();
                mandalaCtx.moveTo(lastX, lastY);
                mandalaCtx.lineTo(x, y);
                mandalaCtx.stroke();
            }
        }
        
        function emitParticles(x, y) {
            const count = Math.floor(particleParams.emissionRate / 20);
            
            for (let i = 0; i < count; i++) {
                // Convert screen coordinates to 3D world coordinates
                const worldX = (x / window.innerWidth) * 20 - 10;
                const worldY = -(y / window.innerHeight) * 20 + 10;
                const worldZ = (Math.random() - 0.5) * 4;
                
                const particle = {
                    position: new THREE.Vector3(worldX, worldY, worldZ),
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 3,
                        Math.random() * 3 + 1,
                        (Math.random() - 0.5) * 3
                    ),
                    life: 6.0 + Math.random() * 2,
                    maxLife: 6.0 + Math.random() * 2,
                    size: particleParams.size + Math.random() * 3
                };
                
                particleParams.particles.push(particle);
            }
        }
        
        function stopDrawing() {
            if (isDrawing) {
                isDrawing = false;
                stopContinuousAudio();
                updateArtProgress();
            }
        }
        
        function startContinuousAudio() {
            if (!audioEnabled || !synth) return;
            
            // Start with a base note that will be modulated
            const baseNotes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3'];
            const baseNote = baseNotes[Math.floor(Math.random() * baseNotes.length)];
            currentNote = synth.triggerAttack(baseNote);
            audioLastTrigger = Date.now();
        }
        
        function updateContinuousAudio(x, y) {
            if (!audioEnabled || !synth) return;
            
            const now = Date.now();
            // Update audio every 100ms to avoid overwhelming the audio system
            if (now - audioLastTrigger < 100) return;
            
            // Map position to musical parameters
            const normalizedX = x / window.innerWidth;  // 0 to 1
            const normalizedY = y / window.innerHeight; // 0 to 1
            
            // Create frequency based on position (pentatonic scale for pleasant sound)
            const pentatonicNotes = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'];
            const noteIndex = Math.floor(normalizedX * pentatonicNotes.length);
            const note = pentatonicNotes[noteIndex] || 'C4';
            
            // Change note based on position
            synth.triggerAttackRelease(note, '32n');
            
            // Modulate reverb based on Y position
            if (reverb && reverb.wet) {
                reverb.wet.value = normalizedY * 0.8; // 0 to 80% wet
            }
            
            audioLastTrigger = now;
        }
        
        function stopContinuousAudio() {
            if (!audioEnabled || !synth) return;
            
            // Release any sustained notes
            synth.triggerRelease();
            currentNote = null;
        }
        
        function updateArtProgress() {
            // Simple metric: count drawing sessions
            const now = Date.now();
            if (!window.lastDrawTime || now - window.lastDrawTime > 2000) {
                artCount++;
                potentialRevenue = artCount * 5; // $5 per piece
                updateRevenue();
                window.lastDrawTime = now;
            }
        }
        
        function updateRevenue() {
            document.getElementById('artCount').textContent = artCount;
            document.getElementById('revenueDisplay').textContent = `$${potentialRevenue.toFixed(2)}`;
        }
        
        function animate() {
            requestAnimationFrame(animate);
            
            // Update particles
            updateParticles();
            updateParticleGeometry();
            
            renderer.render(scene, camera);
        }
        
        function updateParticles() {
            const deltaTime = 0.016; // Roughly 60fps
            
            for (let i = particleParams.particles.length - 1; i >= 0; i--) {
                const particle = particleParams.particles[i];
                
                // Apply gravity
                particle.velocity.y += particleParams.gravity * deltaTime;
                
                // Apply wind with some turbulence
                particle.velocity.x += (particleParams.wind * deltaTime * 0.2) + 
                                     (Math.sin(Date.now() * 0.001) * 0.1);
                
                // Update position
                particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
                
                // Update life
                particle.life -= deltaTime;
                
                // Remove dead particles
                if (particle.life <= 0) {
                    particleParams.particles.splice(i, 1);
                }
            }
            
            // Limit particle count for performance
            while (particleParams.particles.length > 2000) {
                particleParams.particles.shift();
            }
        }
        
        function updateParticleGeometry() {
            const positions = particleSystem.geometry.attributes.position.array;
            const colors = particleSystem.geometry.attributes.color.array;
            const sizes = particleSystem.geometry.attributes.size.array;
            
            for (let i = 0; i < 2000; i++) {
                if (i < particleParams.particles.length) {
                    const particle = particleParams.particles[i];
                    const lifeRatio = particle.life / particle.maxLife;
                    
                    positions[i * 3] = particle.position.x;
                    positions[i * 3 + 1] = particle.position.y;
                    positions[i * 3 + 2] = particle.position.z;
                    
                    // Color interpolation based on life
                    const color = particleParams.startColor.clone().lerp(particleParams.endColor, 1 - lifeRatio);
                    colors[i * 3] = color.r;
                    colors[i * 3 + 1] = color.g;
                    colors[i * 3 + 2] = color.b;
                    
                    sizes[i] = particle.size * lifeRatio * lifeRatio; // Quadratic fade
                } else {
                    // Hide unused particles
                    positions[i * 3] = 0;
                    positions[i * 3 + 1] = 0;
                    positions[i * 3 + 2] = 0;
                    sizes[i] = 0;
                }
            }
            
            particleSystem.geometry.attributes.position.needsUpdate = true;
            particleSystem.geometry.attributes.color.needsUpdate = true;
            particleSystem.geometry.attributes.size.needsUpdate = true;
        }
        
        function clearAll() {
            if (confirm('Clear all your beautiful art? This cannot be undone.')) {
                clearMandala();
                clearParticles();
            }
        }
        
        function clearMandala() {
            mandalaCtx.clearRect(0, 0, mandalaCanvas.width, mandalaCanvas.height);
        }
        
        function clearParticles() {
            particleParams.particles = [];
        }
        
        function previewExport() {
            try {
                // Create preview image
                const previewCanvas = createCombinedImage(false);
                
                // Show preview in a new tab/window
                const previewWindow = window.open();
                previewWindow.document.write(`
                    <html>
                        <head><title>Art Preview</title></head>
                        <body style="margin:0;padding:20px;background:#222;text-align:center;">
                            <h2 style="color:white;">Your Art Preview</h2>
                            <img src="${previewCanvas.toDataURL()}" style="max-width:90%;border:3px solid #4CAF50;">
                            <p style="color:white;">Purchase the high-resolution version for $5</p>
                        </body>
                    </html>
                `);
            } catch (error) {
                alert('Preview generation failed. Try creating some art first!');
            }
        }
        
        async function handlePayment() {
            // Show loading state
            const paymentButton = document.getElementById('paymentButton');
            const loadingSpinner = document.getElementById('paymentLoading');
            
            paymentButton.disabled = true;
            paymentButton.textContent = 'Processing...';
            loadingSpinner.style.display = 'block';
            
            try {
                // Simulate payment processing (replace with real Stripe integration)
                await simulatePayment();
                
                // Payment successful - generate and download high-res
                showSuccessMessage();
                await exportHighRes();
                
                // Update revenue tracking
                potentialRevenue = Math.max(0, potentialRevenue - 5);
                updateRevenue();
                
            } catch (error) {
                alert('Payment failed: ' + error.message);
            } finally {
                // Reset button state
                paymentButton.disabled = false;
                paymentButton.textContent = '💳 Buy High-res ($5)';
                loadingSpinner.style.display = 'none';
            }
        }
        
        async function simulatePayment() {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // For demo purposes, randomly succeed/fail
            if (Math.random() > 0.1) { // 90% success rate for demo
                return { success: true, transactionId: 'sim_' + Date.now() };
            } else {
                throw new Error('Payment declined - please try a different card');
            }
        }
        
        function showSuccessMessage() {
            const successMsg = document.getElementById('successMessage');
            successMsg.style.display = 'block';
            
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 3000);
        }
        
        function createCombinedImage(highRes = false) {
            const scale = highRes ? 4 : 1; // 4x resolution for high-res
            const width = mandalaCanvas.width * scale;
            const height = mandalaCanvas.height * scale;
            
            const combinedCanvas = document.createElement('canvas');
            combinedCanvas.width = width;
            combinedCanvas.height = height;
            const ctx = combinedCanvas.getContext('2d');
            
            // Fill with black background
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);
            
            // Draw mandala (scaled up)
            ctx.drawImage(mandalaCanvas, 0, 0, width, height);
            
            // For high-res, render particles to a separate canvas and composite
            if (highRes && particleParams.particles.length > 0) {
                // Simplified particle rendering for export
                ctx.globalCompositeOperation = 'screen';
                
                particleParams.particles.forEach(particle => {
                    const screenX = ((particle.position.x + 10) / 20) * width;
                    const screenY = ((-particle.position.y + 10) / 20) * height;
                    const lifeRatio = particle.life / particle.maxLife;
                    const size = particle.size * lifeRatio * scale;
                    
                    if (screenX >= 0 && screenX < width && screenY >= 0 && screenY < height) {
                        const color = particleParams.startColor.clone().lerp(particleParams.endColor, 1 - lifeRatio);
                        
                        ctx.beginPath();
                        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, ${lifeRatio})`;
                        ctx.fill();
                    }
                });
                
                ctx.globalCompositeOperation = 'source-over';
            }
            
            return combinedCanvas;
        }
        
        async function exportHighRes() {
            try {
                const highResCanvas = createCombinedImage(true);
                
                // Create download link
                const link = document.createElement('a');
                link.download = `interactive-art-${Date.now()}.png`;
                link.href = highResCanvas.toDataURL('image/png');
                
                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                console.log('High-res download completed');
            } catch (error) {
                console.error('High-res export failed:', error);
                alert('Export failed. Please try again.');
            }
        }
        
        function freeDownload() {
            try {
                const watermarkedCanvas = createWatermarkedImage();
                
                const link = document.createElement('a');
                link.download = `art-preview-${Date.now()}.png`;
                link.href = watermarkedCanvas.toDataURL('image/png');
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                alert('Download failed. Try creating some art first!');
            }
        }
        
        function createWatermarkedImage() {
            const canvas = createCombinedImage(false);
            const ctx = canvas.getContext('2d');
            
            // Add prominent watermark
            ctx.save();
            ctx.globalAlpha = 0.6;
            ctx.font = 'bold 48px Arial';
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.textAlign = 'center';
            
            const text = 'PREVIEW - $5 for HD';
            const x = canvas.width / 2;
            const y = canvas.height / 2;
            
            // Draw text with outline
            ctx.strokeText(text, x, y);
            ctx.fillText(text, x, y);
            
            // Add smaller watermarks in corners
            ctx.font = 'bold 24px Arial';
            ctx.globalAlpha = 0.4;
            
            ctx.fillText('PREVIEW', 100, 50);
            ctx.fillText('PREVIEW', canvas.width - 100, 50);
            ctx.fillText('PREVIEW', 100, canvas.height - 50);
            ctx.fillText('PREVIEW', canvas.width - 100, canvas.height - 50);
            
            ctx.restore();
            
            return canvas;
        }
        
        function onWindowResize() {
            mandalaCanvas.width = window.innerWidth;
            mandalaCanvas.height = window.innerHeight;
            
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        
        function toggleControls() {
            const controls = document.getElementById('controls');
            controls.classList.toggle('hidden');
        }
        
        // Stripe Integration Functions (for production)
        /*
        async function initializeRealStripe() {
            // Initialize Stripe with your publishable key
            stripe = Stripe('pk_test_your_publishable_key_here');
            
            // Create payment elements
            const elements = stripe.elements();
            const cardElement = elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                            color: '#aab7c4',
                        },
                    },
                },
            });
            
            // Mount to a div in your payment form
            cardElement.mount('#card-element');
        }
        
        async function processRealPayment() {
            // Create payment intent on your server
            const response = await fetch('/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: 500, // $5.00 in cents
                    currency: 'usd',
                }),
            });
            
            const { client_secret } = await response.json();
            
            // Confirm payment with Stripe
            const result = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: cardElement,
                }
            });
            
            if (result.error) {
                throw new Error(result.error.message);
            }
            
            return result.paymentIntent;
        }
        */
        
        // Start the app when page loads
        window.addEventListener('load', init);
    </script>