import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.159.0/three.module.js';
let scene, camera, renderer, creature, animationId;
let isAnimating = true;

// Trait arrays for randomization

const blobShapes = [
 { name: 'round', weight: 5 },
 { name: 'elongated', weight: 3 },
 { name: 'chunky', weight: 3 },
 { name: 'angular', weight: 1 },
 { name: 'flowing', weight: 2 }
];
const accessories = [
 { name: 'cap', weight: 5 },
 { name: 'hoodie', weight: 4 },
 { name: 'chain', weight: 3 },
 { name: 'glasses', weight: 4 },
 { name: 'mask', weight: 3 },
 { name: 'headphones', weight: 3 },
 { name: 'graffiti_tag', weight: 2 },
 { name: 'spray_can', weight: 2 },
 { name: 'bandana', weight: 4 },
 { name: 'beanie', weight: 4 },
 { name: 'gas_mask', weight: 1 },
 { name: 'crown', weight: 1 },
 { name: 'backpack', weight: 2 },
 { name: 'sneakers', weight: 3 },
 { name: 'multiple_chains', weight: 2 }];
const colors = [
    { name: 'Midnight', primary: 0x1a1a2e, secondary: 0x16213e, weight: 5 },
    { name: 'Neon', primary: 0xff6b6b, secondary: 0x4ecdc4, weight: 4 },
    { name: 'Urban', primary: 0x2d3436, secondary: 0xddd, weight: 5 },
    { name: 'Toxic', primary: 0x00b894, secondary: 0x00cec9, weight: 3 },
    { name: 'Fire', primary: 0xfd79a8, secondary: 0xfdcb6e, weight: 3 },
    { name: 'Ice', primary: 0x74b9ff, secondary: 0x0984e3, weight: 4 }
];
const backgrounds = [
    { name: 'street', weight: 5 },
    { name: 'alley', weight: 4 },
    { name: 'rooftop', weight: 3 },
    { name: 'underground', weight: 2 },
    { name: 'neon', weight: 4 }
];

const textures = ['smooth', 'dripping', 'splattered', 'cracked', 'glossy'];

const eyeTypes = [
 { name: 'round', weight: 6 },
 { name: 'slit', weight: 4 },
 { name: 'glowing', weight: 2 },
 { name: 'compound', weight: 1 },
 { name: 'none', weight: 3 }
];
const mouthTypes = [
 { name: 'simple_smile', weight: 5 },
 { name: 'simple_frown', weight: 4 },
 { name: 'open', weight: 3 },
 { name: 'none', weight: 2 }
];

function selectWeightedTrait(weightedArray) {
 let totalWeight = 0;
 for (let i = 0; i < weightedArray.length; i++) {
 totalWeight += weightedArray[i].weight;
    }

 let random = Math.random() * totalWeight;

 for (let i = 0; i < weightedArray.length; i++) {
 if (random < weightedArray[i].weight) {
 return weightedArray[i].name;
        }
 random -= weightedArray[i].weight;
    }
}

let currentTraits = {}; // Moved currentTraits definition here

function init() {
    console.log("init() started");
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a1a1a, 10, 50);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);

    console.log("init() started");
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a1a1a, 10, 50);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x1a1a1a, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);

    // Lighting
    
    // Call onWindowResize to set initial canvas size based on container
    onWindowResize();
    setupLighting();

    // Create initial creature
    generateCreature();

    // Animation loop
    animate();

    // Mouse controls
    setupMouseControls();

    // Handle window resize
    window.addEventListener('resize', onWindowResize); // Corrected event listener

    console.log("init() finished");
}
 
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    // Main light
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    // Colored accent lights
    const accentLight1 = new THREE.PointLight(0xff6b6b, 0.5, 10);
    accentLight1.position.set(-3, 2, 3);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0x4ecdc4, 0.5, 10);
    accentLight2.position.set(3, -2, 3);
    scene.add(accentLight2);
}

function generateCreature() {
    console.log("generateCreature() started");
    // Clear existing creature
    if (creature) {
        scene.remove(creature);
        console.log("Existing creature removed.");
    }

    // Generate random traits
    currentTraits = {

        shape: selectWeightedTrait(blobShapes), // Use the weighted selection for shape
 accessory: selectWeightedTrait(accessories), // Use the weighted selection for accessory
 colorScheme: selectWeightedTrait(colors), // Use the weighted selection for colorScheme
        background: selectWeightedTrait(backgrounds), // Use the weighted selection for background
        texture: textures[Math.floor(Math.random() * textures.length)], // Keep this for now, will update next
        size: 0.8 + Math.random() * 0.6,
        inkDrips: Math.floor(Math.random() * 8) + 3,
        rarity: Math.random() < 0.1 ? 'Legendary' : Math.random() < 0.3 ? 'Rare' : 'Common'
 ,
        eyeType: selectWeightedTrait(eyeTypes),
        mouthType: selectWeightedTrait(mouthTypes)
    };

    console.log("Traits generated:", currentTraits);

    // Create creature group
    creature = new THREE.Group();
    console.log("Creature group created:", creature);

    // Create main blob body
    // Find the selected color object by name
    const selectedColor = colors.find(color => color.name === currentTraits.colorScheme);

    // Ensure a color scheme was found
    if (selectedColor) {
 currentTraits.colorScheme = selectedColor; // Update currentTraits with the full color object
 createBlobBody();
    } else {
 console.error("Selected color scheme not found:", currentTraits.colorScheme);
 // Handle error or default color scheme
    }
    console.log("createBlobBody() finished");

    // Add accessories
    addAccessories();
    console.log("addAccessories() finished");

    // Add ink drips
    addInkDrips();
    console.log("addInkDrips() finished");

    // Add face elements
    addFace(creature, currentTraits);
    console.log("addFace() finished");

    // Add to scene
    scene.add(creature);
    console.log("Creature added to scene:", scene);
    updateBackground();
    updateColorSchemeInScene(currentTraits.colorScheme); // Update lights based on selected color scheme
    updateTraitDisplay(); // Call updateTraitDisplay after creature generation
}

function createBlobBody() {
    const colorScheme = currentTraits.colorScheme;

    // Main blob geometry based on shape
    let geometry;
    switch(currentTraits.shape) {
        case 'round':
            geometry = new THREE.SphereGeometry(1.5, 64, 64); 
            break;
        case 'elongated':
            geometry = new THREE.SphereGeometry(1.2, 64, 64); 
            geometry.scale(1, 1.8, 1);
            break;
        case 'chunky':
            geometry = new THREE.BoxGeometry(2.5, 2, 2);
            break;
        case 'angular':
            geometry = new THREE.IcosahedronGeometry(1.8, 2); // Increased detail
            break;
        case 'flowing':
            geometry = new THREE.SphereGeometry(1.3, 64, 64); 
            geometry.scale(1.5, 1, 1.2);
            break;
    }
    
    // Add random deformations for organic look
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);

        const noiseAmount = 0.2; // Adjust the intensity of the noise
        const noiseFrequency = 3; // Adjust the frequency of the noise
        const noise = simpleNoise(x * noiseFrequency, y * noiseFrequency, z * noiseFrequency) * noiseAmount; 
        positions.setXYZ(i, x + noise, y + noise, z + noise); // Apply noise in all directions
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    

    // Material based on texture
    let material;
    switch(currentTraits.texture) {
        case 'smooth':
            material = new THREE.MeshPhongMaterial({
                color: colorScheme.primary,
                shininess: 100
            });
            break;
        case 'dripping':
            material = new THREE.MeshLambertMaterial({
                color: colorScheme.primary,
                transparent: currentTraits.rarity === 'Rare' || currentTraits.rarity === 'Legendary',
                opacity: currentTraits.rarity === 'Rare' || currentTraits.rarity === 'Legendary' ? 0.9 : 1
 });
            break;
        case 'glossy':
            material = new THREE.MeshPhongMaterial({
                color: colorScheme.primary,
                shininess: 200,
                specular: 0x222222
            });
            break;
        default:
            material = new THREE.MeshLambertMaterial({
                color: colorScheme.primary
            });
    }

    const blob = new THREE.Mesh(geometry, material);
    blob.castShadow = true;
    blob.receiveShadow = true;
    blob.scale.multiplyScalar(currentTraits.size);

    creature.add(blob);

    // Add some smaller blob details
    for (let i = 0; i < 3; i++) {
        const detailGeometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.4, 8, 8);
        const detailMaterial = new THREE.MeshLambertMaterial({
            color: colorScheme.secondary,
            transparent: true,
            opacity: 0.8
        });
        const detail = new THREE.Mesh(detailGeometry, detailMaterial);
        detail.position.set(
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 2
        );
        creature.add(detail);
    }
}

function addAccessories() {
    const colorScheme = currentTraits.colorScheme;

    switch(currentTraits.accessory) {
        case 'cap':
            // Simple cap
            const capGeometry = new THREE.CylinderGeometry(1.8, 1.8, 0.3, 8);
            const capMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
            const cap = new THREE.Mesh(capGeometry, capMaterial);
            cap.position.y = 1.8;
            creature.add(cap);
            break;

        case 'chain':
            // Chain necklace
            for (let i = 0; i < 12; i++) {
                const linkGeometry = new THREE.TorusGeometry(0.15, 0.05, 6, 8);
                const linkMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 });
                const link = new THREE.Mesh(linkGeometry, linkMaterial);
                const angle = (i / 12) * Math.PI * 2;
                link.position.set(Math.cos(angle) * 1.2, -0.5, Math.sin(angle) * 1.2);
                creature.add(link);
            }
            break;

        case 'glasses':
            // Sunglasses
            const glassGeometry = new THREE.RingGeometry(0.3, 0.5, 8);
            const glassMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
            const leftGlass = new THREE.Mesh(glassGeometry, glassMaterial);
            const rightGlass = new THREE.Mesh(glassGeometry, glassMaterial);
            leftGlass.position.set(-0.6, 0.3, 1.4);
            rightGlass.position.set(0.6, 0.3, 1.4);
            creature.add(leftGlass);
            creature.add(rightGlass);
            break;

        case 'headphones':
            // Headphones
            const headbandGeometry = new THREE.TorusGeometry(1.8, 0.1, 8, 16, Math.PI);
            const headphoneMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
            const headband = new THREE.Mesh(headbandGeometry, headphoneMaterial);
            headband.rotation.z = Math.PI;
            headband.position.y = 0.5;
            creature.add(headband);
            break;
    }
}

function addFace(creatureGroup, traits) {
    const colorScheme = traits.colorScheme;
    const faceMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 }); // Default black for face features

    // Add Eyes
    switch (traits.eyeType) {
        case 'round':
            const eyeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
            const leftEye = new THREE.Mesh(eyeGeometry, faceMaterial);
            const rightEye = new THREE.Mesh(eyeGeometry, faceMaterial);
            leftEye.position.set(-0.5, 0.5, 1.6);
            rightEye.position.set(0.5, 0.5, 1.6);
            creatureGroup.add(leftEye);
            creatureGroup.add(rightEye);
            break;
        case 'slit':
            const slitEyeGeometry = new THREE.BoxGeometry(0.6, 0.15, 0.1);
            const slitEyeMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
            const leftSlitEye = new THREE.Mesh(slitEyeGeometry, slitEyeMaterial);
            const rightSlitEye = new THREE.Mesh(slitEyeGeometry, slitEyeMaterial);
            leftSlitEye.position.set(-0.5, 0.5, 1.6);
            rightSlitEye.position.set(0.5, 0.5, 1.6);
            creatureGroup.add(leftSlitEye);
            creatureGroup.add(rightSlitEye);
            break;
        case 'glowing':
            const glowingEyeGeometry = new THREE.SphereGeometry(0.25, 16, 16);
            const glowingEyeMaterial = new THREE.MeshBasicMaterial({ color: colorScheme.secondary, emissive: colorScheme.secondary, emissiveIntensity: 1.5 });
            const leftGlowingEye = new THREE.Mesh(glowingEyeGeometry, glowingEyeMaterial);
            const rightGlowingEye = new THREE.Mesh(glowingEyeGeometry, glowingEyeMaterial);
            leftGlowingEye.position.set(-0.5, 0.5, 1.6);
            rightGlowingEye.position.set(0.5, 0.5, 1.6);
            creatureGroup.add(leftGlowingEye);
            creatureGroup.add(rightGlowingEye);
            break;
        case 'compound':
            const compoundEyeGroupLeft = new THREE.Group();
            const compoundEyeGroupRight = new THREE.Group();
            const subEyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const subEyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
            for (let i = 0; i < 5; i++) {
                const subEyeLeft = new THREE.Mesh(subEyeGeometry, subEyeMaterial);
                const subEyeRight = new THREE.Mesh(subEyeGeometry, subEyeMaterial);
                const angle = (i / 5) * Math.PI - Math.PI / 2;
                subEyeLeft.position.set(Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0);
                subEyeRight.position.set(Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0);
                compoundEyeGroupLeft.add(subEyeLeft);
                compoundEyeGroupRight.add(subEyeRight);
            }
            compoundEyeGroupLeft.position.set(-0.5, 0.5, 1.6);
compoundEyeGroupLeft.rotation.y = Math.PI * 0.1;
            compoundEyeGroupRight.position.set(0.5, 0.5, 1.6);
compoundEyeGroupRight.rotation.y = -Math.PI * 0.1;
            creatureGroup.add(compoundEyeGroupLeft);
            creatureGroup.add(compoundEyeGroupRight);
            break;
        case 'none':
            // No eyes added
            break;
    }

    // Add Mouth
    switch (traits.mouthType) {
        case 'simple_smile':
            const smileGeometry = new THREE.TorusGeometry(0.6, 0.05, 6, 10, Math.PI);
            const smile = new THREE.Mesh(smileGeometry, faceMaterial);
            smile.position.set(0, -0.3, 1.6);
            creatureGroup.add(smile);
            break;
        case 'simple_frown':
            const frownGeometry = new THREE.TorusGeometry(0.6, 0.05, 6, 10, Math.PI);
            const frown = new THREE.Mesh(frownGeometry, faceMaterial);
            frown.rotation.z = Math.PI;
            frown.position.set(0, -0.3, 1.6);
            creatureGroup.add(frown);
            break;
        case 'open':
            const openMouthGeometry = new THREE.SphereGeometry(0.4, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
            const openMouth = new THREE.Mesh(openMouthGeometry, faceMaterial);
            openMouth.position.set(0, -0.5, 1.6);
            openMouth.rotation.x = Math.PI * 0.5;
            creatureGroup.add(openMouth);
            break;
        case 'none':
            // No mouth added
            break;
    }
}

function addInkDrips() {
    const colorScheme = currentTraits.colorScheme;

    for (let i = 0; i < currentTraits.inkDrips; i++) {
        const dripGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.2, 6, 6);
        dripGeometry.scale(1, 2 + Math.random() * 2, 1);

        const dripMaterial = new THREE.MeshLambertMaterial({
            color: Math.random() < 0.5 ? colorScheme.primary : 0x000000,
            transparent: true,
            opacity: 0.7 + Math.random() * 0.3
        });

        const drip = new THREE.Mesh(dripGeometry, dripMaterial);
        drip.position.set(
            (Math.random() - 0.5) * 4,
            -2 - Math.random() * 2,
            (Math.random() - 0.5) * 2
        );
        drip.rotation.z = (Math.random() - 0.5) * 0.5;

        creature.add(drip);
    }
}

function updateBackground() {
    const bg = currentTraits.background;
    let color;

    switch(bg) {
        case 'street':
            color = 0x2d3436;
            break;
        case 'alley':
            color = 0x1a1a1a;
            break;
        case 'rooftop':
            color = 0x636e72;
            break;
        case 'underground':
            color = 0x0d1117;
            break;
        case 'neon':
            color = 0x2d1b69;
            break;
        default:
            color = 0x1a1a1a;
    }

    renderer.setClearColor(color, 1);
    scene.fog.color.setHex(color);
}

function updateTraitDisplay() {
    const traitsDiv = document.getElementById('traits');
    traitsDiv.innerHTML = `
        <div class="trait-item"><strong>Shape:</strong> ${currentTraits.shape}</div>
        <div class="trait-item"><strong>Accessory:</strong> ${currentTraits.accessory}</div>
        <div class="trait-item"><strong>Color:</strong> ${currentTraits.colorScheme.name}</div>
        <div class="trait-item"><strong>Background:</strong> ${currentTraits.background}</div>
        <div class="trait-item"><strong>Texture:</strong> ${currentTraits.texture}</div>
        <div class="trait-item"><strong>Size:</strong> ${(currentTraits.size).toFixed(2)}</div>
        <div class="trait-item"><strong>Ink Drips:</strong> ${currentTraits.inkDrips}</div>
        <div class="trait-item"><strong>Rarity:</strong> <span style="color: ${currentTraits.rarity === 'Legendary' ? '#ffd700' : currentTraits.rarity === 'Rare' ? '#ff6b6b' : '#4ecdc4'}">${currentTraits.rarity}</span></div>
    `;
}

function updateColorSchemeInScene(colorScheme) {
    // Remove existing lights except ambient and directional (or handle them specifically)
    scene.children.forEach(child => {
        if (child instanceof THREE.PointLight) {
            scene.remove(child);
        }
    });

    // Add new colored accent lights based on the new color scheme
    const accentLight1 = new THREE.PointLight(colorScheme.primary, 0.5, 10);
    accentLight1.position.set(-3, 2, 3);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(colorScheme.secondary, 0.5, 10);
    accentLight2.position.set(3, -2, 3);
    scene.add(accentLight2);
}

function setupMouseControls() {
    let isDragging = false;
    let previousMouseX = 0, previousMouseY = 0;

    renderer.domElement.addEventListener('mousedown', (event) => {
        isDragging = true;
        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
    });

    renderer.domElement.addEventListener('mousemove', (event) => {
        if (!isDragging) return;

        const deltaX = event.clientX - previousMouseX;
        const deltaY = event.clientY - previousMouseY;

        if (creature) {
            creature.rotation.y += deltaX * 0.005; // Adjust sensitivity as needed
            creature.rotation.x += deltaY * 0.005; // Adjust sensitivity as needed
        }

        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
    });

    renderer.domElement.addEventListener('mouseup', () => {
        isDragging = false;
    });

    renderer.domElement.addEventListener('mouseleave', () => {
        isDragging = false;
    });
}

function animate() {
    if (!isAnimating) return;

    animationId = requestAnimationFrame(animate);

    // Animate creature
    if (creature) {
        creature.rotation.y += 0.005;

        // Floating animation
        creature.position.y = Math.sin(Date.now() * 0.001) * 0.2; // Vertical float

        // Organic pulse/breathing animation
        if (creature.children[0] && creature.children[0].geometry.attributes.position) {
            animateBlob(creature.children[0]);
        }

        // Pulse effect for legendary creatures
        if (currentTraits.rarity === 'Legendary') {
            const scale = 1 + Math.sin(Date.now() * 0.003) * 0.05;
            creature.scale.set(scale, scale, scale);
        }
    }

    renderer.render(scene, camera);
}

function animateBlob(blobMesh) {
    const positions = blobMesh.geometry.attributes.position;
    const initialPositions = blobMesh.geometry.attributes.initialPosition;

    if (!initialPositions) return; // Ensure initial positions are stored

    const time = Date.now() * 0.002;
    for (let i = 0; i < positions.count; i++) {
        const noise = simpleNoise(initialPositions.getX(i) * 5 + time, initialPositions.getY(i) * 5 + time, initialPositions.getZ(i) * 5 + time) * 0.1;
        positions.setXYZ(i, initialPositions.getX(i) + noise, initialPositions.getY(i) + noise, initialPositions.getZ(i) + noise);
    }
    positions.needsUpdate = true;
}

function toggleAnimation() {
    isAnimating = !isAnimating;
    if (isAnimating) {
        animate();
    } else {
        cancelAnimationFrame(animationId);
    }
}

function changeBackground() {
    currentTraits.background = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    updateBackground();
    updateTraitDisplay();
}

function randomizeAll() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => generateCreature(), i * 200);
    }
}

function exportNFT() {
    // Create a high-resolution render
    const originalSize = renderer.getSize(new THREE.Vector2());
    renderer.setSize(1024, 1024);
    renderer.render(scene, camera);

    // Get image data
    const imageData = renderer.domElement.toDataURL('image/png');

    // Create download link
    const link = document.createElement('a');
    link.download = `ink-blob-creature-${Date.now()}.png`;
    link.href = imageData;
    link.click();

    // Restore original size
    renderer.setSize(originalSize.x, originalSize.y);

    // Also log the metadata
}

function onWindowResize() {
    const container = document.getElementById('container');
    if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        camera.aspect = containerWidth / containerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerWidth, containerHeight);
    }
}

function simpleNoise(x, y, z) {
    let noise = 0;
    noise += Math.sin(x + y + z) * 0.5;
    noise += Math.sin(x * 2 + y * 2 + z * 2) * 0.25;
    noise += Math.sin(x * 4 + y * 4 + z * 4) * 0.125; // Adjusted frequencies
    // Add more terms with increasing frequencies and decreasing amplitudes for more detail
    return noise;
}

// Initialize the application after a small delay

// Add a DOMContentLoaded event listener to ensure UI elements are available
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded fired");
    init(); // Call init inside DOMContentLoaded

    // Get button references
    const generateCreatureButton = document.getElementById('generateCreatureButton');
    const exportNFTButton = document.getElementById('exportNFTButton');
    const randomizeAllButton = document.getElementById('randomizeAllButton');
    const changeBackgroundButton = document.getElementById('changeBackgroundButton');
    const toggleAnimationButton = document.getElementById('toggleAnimationButton');

    // Add click event listeners
    if (generateCreatureButton) {
        generateCreatureButton.addEventListener('click', generateCreature);
        console.log("Added click listener to generateCreatureButton");
    } else {
        console.error("generateCreatureButton not found!");
    }
    if (exportNFTButton) {
        exportNFTButton.addEventListener('click', exportNFT);
        console.log("Added click listener to exportNFTButton");
    } else {
        console.error("exportNFTButton not found!");
    }
    if (randomizeAllButton) {
        randomizeAllButton.addEventListener('click', randomizeAll);
        console.log("Added click listener to randomizeAllButton");
    } else {
        console.error("randomizeAllButton not found!");
    }
    if (changeBackgroundButton) {
        changeBackgroundButton.addEventListener('click', changeBackground);
        console.log("Added click listener to changeBackgroundButton");
    } else {
        console.error("changeBackgroundButton not found!");
    }

    updateTraitDisplay(); // Call updateTraitDisplay here as well, since it's UI related

    if (toggleAnimationButton) {
        toggleAnimationButton.addEventListener('click', toggleAnimation);
        console.log("Added click listener to toggleAnimationButton");
    } else {
        console.error("toggleAnimationButton not found!");
    }
});
