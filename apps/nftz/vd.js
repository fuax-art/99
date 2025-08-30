        // Initialize Three.js scene
        let scene, camera, renderer, controls, doll;
        let currentDollId = 0;
        let generatedNFTs = [];
        
        // Attribute options
        const attributes = {
            backgrounds: {
                dark: { color: 0x222222, texture: null },
                wood: { color: 0x8B4513, texture: null },
                fire: { color: 0xFF4500, texture: null }
            },
            bodyShapes: ['basic', 'tall', 'wide', 'curvy'],
            fabrics: ['burlap', 'leather', 'lizard', 'linen', 'silk'],
            eyes: ['round', 'slit', 'glowing', 'button', 'x-shaped'],
            mouths: ['stitched', 'open', 'fanged', 'zipper', 'none'],
            hats: ['none', 'tophat', 'bandana', 'cowboy', 'witch', 'pirate', 'none', 'none', 'none'], // More weight to 'none'
            props: {
                traditional: ['needle', 'candle', 'feather', 'skull', 'bones'],
                pirate: ['parrot', 'pegleg', 'hook', 'treasure', 'rum'],
                gangster: ['uzi', 'cash', 'dice', 'cigar', 'chains']
            }
        };
        
        // Color palettes
        const colorPalettes = [
            ['#8B4513', '#A0522D', '#FF0000'], // Earth tones
            ['#4B0082', '#800080', '#FF00FF'], // Purple theme
            ['#006400', '#228B22', '#32CD32'], // Green theme
            ['#8B0000', '#B22222', '#FF6347'], // Red theme
            ['#00008B', '#1E90FF', '#00BFFF'], // Blue theme
            ['#DAA520', '#FFD700', '#FFA500']  // Gold theme
        ];
        
        // Initialize the 3D scene
        function init() {
            // Create scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x333333);
            
            // Create camera
            camera = new THREE.PerspectiveCamera(75, document.getElementById('canvas-container').clientWidth / document.getElementById('canvas-container').clientHeight, 0.1, 1000);
            camera.position.z = 5;
            
            // Create renderer
            renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
            renderer.setSize(document.getElementById('canvas-container').clientWidth, document.getElementById('canvas-container').clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            
            // Add controls
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.25;
            
            // Add lights
            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(1, 1, 1);
            scene.add(directionalLight);
            
            // Create initial doll
            createRandomDoll();
            
            // Handle window resize
            window.addEventListener('resize', onWindowResize);
            
            // Set up event listeners
            document.getElementById('generateBtn').addEventListener('click', generateNFTBatch);
            document.getElementById('bodyColor').addEventListener('input', updateDollColors);
            document.getElementById('fabricColor').addEventListener('input', updateDollColors);
            document.getElementById('eyeColor').addEventListener('input', updateDollColors);
            
            // Start animation loop
            animate();
        }
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        
        // Handle window resize
        function onWindowResize() {
            camera.aspect = document.getElementById('canvas-container').clientWidth / document.getElementById('canvas-container').clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(document.getElementById('canvas-container').clientWidth, document.getElementById('canvas-container').clientHeight);
        }
        
        // Create a random voodoo doll
        function createRandomDoll() {
            // Clear previous doll if exists
            if (doll) {
                scene.remove(doll);
            }
            
            // Get selected background
            const bgSelect = document.getElementById('backgroundSelect').value;
            let background;
            if (bgSelect === 'random') {
                const bgKeys = Object.keys(attributes.backgrounds);
                background = attributes.backgrounds[bgKeys[Math.floor(Math.random() * bgKeys.length)]];
            } else {
                background = attributes.backgrounds[bgSelect];
            }
            scene.background = new THREE.Color(background.color);
            
            // Get color palette
            let bodyColor, fabricColor, eyeColor;
            if (document.getElementById('randomizeColors').checked) {
                const palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
                bodyColor = palette[0];
                fabricColor = palette[1];
                eyeColor = palette[2];
                
                // Update color pickers
                document.getElementById('bodyColor').value = bodyColor;
                document.getElementById('fabricColor').value = fabricColor;
                document.getElementById('eyeColor').value = eyeColor;
            } else {
                bodyColor = document.getElementById('bodyColor').value;
                fabricColor = document.getElementById('fabricColor').value;
                eyeColor = document.getElementById('eyeColor').value;
            }
            
            // Get theme
            const themeSelect = document.getElementById('themeSelect').value;
            let theme;
            if (themeSelect === 'random') {
                const themeKeys = Object.keys(attributes.props);
                theme = themeKeys[Math.floor(Math.random() * themeKeys.length)];
            } else {
                theme = themeSelect;
            }
            
            // Create doll group
            doll = new THREE.Group();
            
            // Create body shape
            const bodyShape = attributes.bodyShapes[Math.floor(Math.random() * attributes.bodyShapes.length)];
            const bodyGeometry = createBodyGeometry(bodyShape);
            const bodyMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color(bodyColor) });
            const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
            doll.add(bodyMesh);
            
            // Create fabric layer
            const fabricType = attributes.fabrics[Math.floor(Math.random() * attributes.fabrics.length)];
            const fabricGeometry = createFabricGeometry(bodyShape, fabricType);
            const fabricMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color(fabricColor),
                // Add some fabric-like texture
                bumpScale: 0.05,
                specular: new THREE.Color(0x111111)
            });
            const fabricMesh = new THREE.Mesh(fabricGeometry, fabricMaterial);
            doll.add(fabricMesh);
            
            // Create eyes
            const eyeType = attributes.eyes[Math.floor(Math.random() * attributes.eyes.length)];
            const eyes = createEyes(eyeType, eyeColor);
            doll.add(eyes);
            
            // Create mouth
            const mouthType = attributes.mouths[Math.floor(Math.random() * attributes.mouths.length)];
            const mouth = createMouth(mouthType);
            doll.add(mouth);
            
            // Create hat (with higher chance of no hat)
            const hatType = attributes.hats[Math.floor(Math.random() * attributes.hats.length)];
            if (hatType !== 'none') {
                const hat = createHat(hatType);
                doll.add(hat);
            }
            
            // Create prop (with small chance of no prop)
            if (Math.random() > 0.1) {
                const props = attributes.props[theme];
                const propType = props[Math.floor(Math.random() * props.length)];
                const prop = createProp(propType);
                doll.add(prop);
            }
            
            // Add doll to scene
            scene.add(doll);
            
            // Return the attributes for metadata
            return {
                background: bgSelect === 'random' ? 'random' : bgSelect,
                bodyShape,
                fabricType,
                eyeType,
                mouthType,
                hatType,
                propTheme: theme,
                colors: {
                    body: bodyColor,
                    fabric: fabricColor,
                    eyes: eyeColor
                }
            };
        }
        
        // Create body geometry based on shape type
        function createBodyGeometry(shape) {
            let geometry;
            switch(shape) {
                case 'tall':
                    geometry = new THREE.CylinderGeometry(0.5, 0.3, 1.5, 8);
                    break;
                case 'wide':
                    geometry = new THREE.SphereGeometry(0.7, 16, 8);
                    geometry.scale(1, 1.5, 1);
                    break;
                case 'curvy':
                    geometry = new THREE.SphereGeometry(0.6, 16, 8);
                    geometry.scale(1, 1.8, 1);
                    break;
                default: // basic
                    geometry = new THREE.CylinderGeometry(0.5, 0.4, 1, 8);
            }
            return geometry;
        }
        
        // Create fabric geometry with texture based on type
        function createFabricGeometry(bodyShape, fabricType) {
            // For simplicity, we'll use the same geometry as body but slightly larger
            const bodyGeometry = createBodyGeometry(bodyShape);
            
            // Scale up slightly to cover the body
            bodyGeometry.scale(1.05, 1.05, 1.05);
            
            return bodyGeometry;
        }
        
        // Create eyes based on type
        function createEyes(eyeType, color) {
            const eyes = new THREE.Group();
            const eyeMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color(color) });
            
            // Position eyes
            const leftEyePos = new THREE.Vector3(-0.3, 0.2, 0.5);
            const rightEyePos = new THREE.Vector3(0.3, 0.2, 0.5);
            
            switch(eyeType) {
                case 'slit':
                    // Slit eyes
                    const slitGeometry = new THREE.BoxGeometry(0.2, 0.05, 0.1);
                    const leftSlit = new THREE.Mesh(slitGeometry, eyeMaterial);
                    leftSlit.position.copy(leftEyePos);
                    const rightSlit = new THREE.Mesh(slitGeometry, eyeMaterial);
                    rightSlit.position.copy(rightEyePos);
                    eyes.add(leftSlit);
                    eyes.add(rightSlit);
                    break;
                case 'glowing':
                    // Glowing eyes (emissive material)
                    const glowMaterial = new THREE.MeshPhongMaterial({ 
                        color: new THREE.Color(color),
                        emissive: new THREE.Color(color),
                        emissiveIntensity: 0.8
                    });
                    const glowGeometry = new THREE.SphereGeometry(0.15, 16, 8);
                    const leftGlow = new THREE.Mesh(glowGeometry, glowMaterial);
                    leftGlow.position.copy(leftEyePos);
                    const rightGlow = new THREE.Mesh(glowGeometry, glowMaterial);
                    rightGlow.position.copy(rightEyePos);
                    eyes.add(leftGlow);
                    eyes.add(rightGlow);
                    break;
                case 'button':
                    // Button eyes
                    const buttonGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16);
                    const leftButton = new THREE.Mesh(buttonGeometry, eyeMaterial);
                    leftButton.position.copy(leftEyePos);
                    leftButton.rotation.x = Math.PI / 2;
                    const rightButton = new THREE.Mesh(buttonGeometry, eyeMaterial);
                    rightButton.position.copy(rightEyePos);
                    rightButton.rotation.x = Math.PI / 2;
                    eyes.add(leftButton);
                    eyes.add(rightButton);
                    break;
                case 'x-shaped':
                    // X-shaped eyes (two crossed cylinders)
                    const xGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8);
                    xGeometry.rotateZ(Math.PI / 4);
                    const xGeometry2 = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8);
                    xGeometry2.rotateZ(-Math.PI / 4);
                    
                    const leftX1 = new THREE.Mesh(xGeometry, eyeMaterial);
                    const leftX2 = new THREE.Mesh(xGeometry2, eyeMaterial);
                    leftX1.position.copy(leftEyePos);
                    leftX2.position.copy(leftEyePos);
                    
                    const rightX1 = new THREE.Mesh(xGeometry, eyeMaterial);
                    const rightX2 = new THREE.Mesh(xGeometry2, eyeMaterial);
                    rightX1.position.copy(rightEyePos);
                    rightX2.position.copy(rightEyePos);
                    
                    eyes.add(leftX1);
                    eyes.add(leftX2);
                    eyes.add(rightX1);
                    eyes.add(rightX2);
                    break;
                default: // round
                    // Round eyes
                    const roundGeometry = new THREE.SphereGeometry(0.15, 16, 8);
                    const leftRound = new THREE.Mesh(roundGeometry, eyeMaterial);
                    leftRound.position.copy(leftEyePos);
                    const rightRound = new THREE.Mesh(roundGeometry, eyeMaterial);
                    rightRound.position.copy(rightEyePos);
                    eyes.add(leftRound);
                    eyes.add(rightRound);
            }
            
            return eyes;
        }
        
        // Create mouth based on type
        function createMouth(mouthType) {
            const mouth = new THREE.Group();
            const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
            
            switch(mouthType) {
                case 'open':
                    // Open mouth (half cylinder)
                    const openGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8, 1, true, 0, Math.PI);
                    openGeometry.rotateX(Math.PI / 2);
                    const openMouth = new THREE.Mesh(openGeometry, mouthMaterial);
                    openMouth.position.set(0, -0.1, 0.5);
                    mouth.add(openMouth);
                    break;
                case 'fanged':
                    // Fanged mouth (open mouth with teeth)
                    const fangGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8, 1, true, 0, Math.PI);
                    fangGeometry.rotateX(Math.PI / 2);
                    const fangMouth = new THREE.Mesh(fangGeometry, mouthMaterial);
                    fangMouth.position.set(0, -0.1, 0.5);
                    mouth.add(fangMouth);
                    
                    // Add fangs
                    const fangMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
                    const fangTooth = new THREE.ConeGeometry(0.05, 0.1, 8);
                    
                    const fang1 = new THREE.Mesh(fangTooth, fangMaterial);
                    fang1.position.set(-0.15, -0.15, 0.55);
                    fang1.rotation.x = Math.PI;
                    
                    const fang2 = new THREE.Mesh(fangTooth, fangMaterial);
                    fang2.position.set(0.15, -0.15, 0.55);
                    fang2.rotation.x = Math.PI;
                    
                    mouth.add(fang1);
                    mouth.add(fang2);
                    break;
                case 'zipper':
                    // Zipper mouth (zigzag line)
                    const zipperPoints = [];
                    for (let i = -0.3; i <= 0.3; i += 0.1) {
                        zipperPoints.push(new THREE.Vector3(i, -0.1 + (i % 0.2 === 0 ? 0.05 : -0.05), 0.5));
                    }
                    const zipperGeometry = new THREE.BufferGeometry().setFromPoints(zipperPoints);
                    const zipperMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
                    const zipper = new THREE.Line(zipperGeometry, zipperMaterial);
                    mouth.add(zipper);
                    break;
                case 'none':
                    // No mouth
                    break;
                default: // stitched
                    // Stitched mouth (dashed line)
                    const stitchPoints = [];
                    for (let i = -0.3; i <= 0.3; i += 0.05) {
                        stitchPoints.push(new THREE.Vector3(i, -0.1, 0.5));
                    }
                    const stitchGeometry = new THREE.BufferGeometry().setFromPoints(stitchPoints);
                    const stitchMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
                    const stitches = new THREE.Line(stitchGeometry, stitchMaterial);
                    mouth.add(stitches);
            }
            
            return mouth;
        }
        
        // Create hat based on type
        function createHat(hatType) {
            const hat = new THREE.Group();
            const hatMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
            
            switch(hatType) {
                case 'tophat':
                    // Top hat (cylinder with wider top)
                    const brimGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.05, 16);
                    const brim = new THREE.Mesh(brimGeometry, hatMaterial);
                    brim.position.y = 0.8;
                    
                    const topGeometry = new THREE.CylinderGeometry(0.4, 0.3, 0.5, 16);
                    const top = new THREE.Mesh(topGeometry, hatMaterial);
                    top.position.y = 1.05;
                    
                    hat.add(brim);
                    hat.add(top);
                    break;
                case 'bandana':
                    // Bandana (tilted plane)
                    const bandanaGeometry = new THREE.PlaneGeometry(0.8, 0.4);
                    bandanaGeometry.rotateX(Math.PI / 4);
                    bandanaGeometry.rotateZ(Math.PI / 8);
                    const bandana = new THREE.Mesh(bandanaGeometry, hatMaterial);
                    bandana.position.set(0, 0.7, 0);
                    hat.add(bandana);
                    break;
                case 'cowboy':
                    // Cowboy hat (cone with wide brim)
                    const cowboyBrimGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.05, 16);
                    const cowboyBrim = new THREE.Mesh(cowboyBrimGeometry, hatMaterial);
                    cowboyBrim.position.y = 0.7;
                    
                    const cowboyTopGeometry = new THREE.ConeGeometry(0.4, 0.3, 16);
                    const cowboyTop = new THREE.Mesh(cowboyTopGeometry, hatMaterial);
                    cowboyTop.position.y = 0.85;
                    
                    hat.add(cowboyBrim);
                    hat.add(cowboyTop);
                    break;
                case 'witch':
                    // Witch hat (tall cone)
                    const witchGeometry = new THREE.ConeGeometry(0.5, 1, 16);
                    const witchHat = new THREE.Mesh(witchGeometry, hatMaterial);
                    witchHat.position.y = 1.1;
                    hat.add(witchHat);
                    break;
                case 'pirate':
                    // Pirate hat (tricorn)
                    const pirateBaseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
                    const pirateBase = new THREE.Mesh(pirateBaseGeometry, hatMaterial);
                    pirateBase.position.y = 0.8;
                    
                    const pirateSideGeometry = new THREE.PlaneGeometry(0.6, 0.4);
                    pirateSideGeometry.rotateX(Math.PI / 2);
                    pirateSideGeometry.rotateY(Math.PI / 4);
                    
                    const pirateSide1 = new THREE.Mesh(pirateSideGeometry, hatMaterial);
                    pirateSide1.position.set(0.3, 0.8, 0.3);
                    
                    const pirateSide2 = new THREE.Mesh(pirateSideGeometry, hatMaterial);
                    pirateSide2.position.set(-0.3, 0.8, 0.3);
                    pirateSide2.rotateY(-Math.PI / 2);
                    
                    hat.add(pirateBase);
                    hat.add(pirateSide1);
                    hat.add(pirateSide2);
                    break;
            }
            
            return hat;
        }
        
        // Create prop based on type
        function createProp(propType) {
            const prop = new THREE.Group();
            const woodMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
            const metalMaterial = new THREE.MeshPhongMaterial({ color: 0xC0C0C0, specular: 0xFFFFFF, shininess: 30 });
            const blackMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
            
            switch(propType) {
                case 'needle':
                    // Needle (thin cylinder)
                    const needleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
                    const needle = new THREE.Mesh(needleGeometry, metalMaterial);
                    needle.position.set(0.5, 0, 0);
                    needle.rotation.z = Math.PI / 2;
                    prop.add(needle);
                    break;
                case 'candle':
                    // Candle (cylinder with flame)
                    const candleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 16);
                    const candle = new THREE.Mesh(candleGeometry, new THREE.MeshPhongMaterial({ color: 0xF5DEB3 }));
                    candle.position.set(0.6, 0.2, 0);
                    
                    const flameGeometry = new THREE.ConeGeometry(0.08, 0.3, 8);
                    const flameMaterial = new THREE.MeshPhongMaterial({ 
                        color: 0xFF4500,
                        emissive: 0xFF4500,
                        emissiveIntensity: 0.5,
                        transparent: true,
                        opacity: 0.8
                    });
                    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
                    flame.position.set(0.6, 0.5, 0);
                    
                    prop.add(candle);
                    prop.add(flame);
                    break;
                case 'feather':
                    // Feather (triangle with texture)
                    const featherGeometry = new THREE.ConeGeometry(0.15, 0.6, 3);
                    featherGeometry.rotateZ(Math.PI / 2);
                    const feather = new THREE.Mesh(featherGeometry, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }));
                    feather.position.set(0.7, 0.3, 0);
                    prop.add(feather);
                    break;
                case 'skull':
                    // Skull (sphere with holes)
                    const skullGeometry = new THREE.SphereGeometry(0.2, 16, 8);
                    const skull = new THREE.Mesh(skullGeometry, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }));
                    skull.position.set(0.7, 0.2, 0);
                    prop.add(skull);
                    break;
                case 'bones':
                    // Crossed bones
                    const boneGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
                    
                    const bone1 = new THREE.Mesh(boneGeometry, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }));
                    bone1.position.set(0.5, 0.2, 0);
                    bone1.rotation.z = Math.PI / 4;
                    
                    const bone2 = new THREE.Mesh(boneGeometry, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }));
                    bone2.position.set(0.5, 0.2, 0);
                    bone2.rotation.z = -Math.PI / 4;
                    
                    prop.add(bone1);
                    prop.add(bone2);
                    break;
                case 'parrot':
                    // Parrot (colored bird)
                    const parrotBodyGeometry = new THREE.SphereGeometry(0.15, 16, 8);
                    const parrotBody = new THREE.Mesh(parrotBodyGeometry, new THREE.MeshPhongMaterial({ color: 0xFF0000 }));
                    parrotBody.position.set(0.7, 0.4, 0);
                    
                    const parrotHeadGeometry = new THREE.SphereGeometry(0.1, 16, 8);
                    const parrotHead = new THREE.Mesh(parrotHeadGeometry, new THREE.MeshPhongMaterial({ color: 0x0000FF }));
                    parrotHead.position.set(0.7, 0.55, 0);
                    
                    const parrotBeakGeometry = new THREE.ConeGeometry(0.05, 0.1, 8);
                    const parrotBeak = new THREE.Mesh(parrotBeakGeometry, new THREE.MeshPhongMaterial({ color: 0xFFFF00 }));
                    parrotBeak.position.set(0.7, 0.55, 0.1);
                    
                    prop.add(parrotBody);
                    prop.add(parrotHead);
                    prop.add(parrotBeak);
                    break;
                case 'pegleg':
                    // Pegleg (wooden leg)
                    const peglegGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.7, 8);
                    const pegleg = new THREE.Mesh(peglegGeometry, woodMaterial);
                    pegleg.position.set(0.6, -0.35, 0);
                    prop.add(pegleg);
                    break;
                case 'hook':
                    // Hook (metal hook)
                    const hookBaseGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
                    const hookBase = new THREE.Mesh(hookBaseGeometry, metalMaterial);
                    hookBase.position.set(0.6, 0.1, 0);
                    
                    const hookCurveGeometry = new THREE.TorusGeometry(0.1, 0.03, 8, 8, Math.PI / 2);
                    hookCurveGeometry.rotateY(Math.PI / 2);
                    const hookCurve = new THREE.Mesh(hookCurveGeometry, metalMaterial);
                    hookCurve.position.set(0.6, 0.1, 0.1);
                    
                    prop.add(hookBase);
                    prop.add(hookCurve);
                    break;
                case 'treasure':
                    // Treasure chest
                    const chestGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.2);
                    const chest = new THREE.Mesh(chestGeometry, new THREE.MeshPhongMaterial({ color: 0x8B4513 }));
                    chest.position.set(0.7, 0.1, 0);
                    prop.add(chest);
                    break;
                case 'rum':
                    // Rum bottle
                    const bottleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 16);
                    const bottle = new THREE.Mesh(bottleGeometry, new THREE.MeshPhongMaterial({ color: 0x8B0000, transparent: true, opacity: 0.7 }));
                    bottle.position.set(0.6, 0.2, 0);
                    prop.add(bottle);
                    break;
                case 'uzi':
                    // Uzi (simplified)
                    const uziBaseGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.2);
                    const uziBase = new THREE.Mesh(uziBaseGeometry, blackMaterial);
                    uziBase.position.set(0.8, 0.1, 0);
                    
                    const uziHandleGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
                    const uziHandle = new THREE.Mesh(uziHandleGeometry, blackMaterial);
                    uziHandle.position.set(0.65, 0.15, 0);
                    
                    prop.add(uziBase);
                    prop.add(uziHandle);
                    break;
                case 'cash':
                    // Cash stack
                    const cashGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.2);
                    const cash = new THREE.Mesh(cashGeometry, new THREE.MeshPhongMaterial({ color: 0x008000 }));
                    cash.position.set(0.7, 0.1, 0);
                    prop.add(cash);
                    break;
                case 'dice':
                    // Dice
                    const diceGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
                    const dice = new THREE.Mesh(diceGeometry, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }));
                    dice.position.set(0.7, 0.15, 0);
                    prop.add(dice);
                    break;
                case 'cigar':
                    // Cigar (cylinder)
                    const cigarGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
                    const cigar = new THREE.Mesh(cigarGeometry, new THREE.MeshPhongMaterial({ color: 0x8B4513 }));
                    cigar.position.set(0.6, 0.2, 0);
                    cigar.rotation.z = Math.PI / 4;
                    prop.add(cigar);
                    break;
                case 'chains':
                    // Chains (linked circles)
                    const chainLinkGeometry = new THREE.TorusGeometry(0.05, 0.02, 8, 8);
                    
                    const chainLink1 = new THREE.Mesh(chainLinkGeometry, metalMaterial);
                    chainLink1.position.set(0.6, 0.3, 0);
                    
                    const chainLink2 = new THREE.Mesh(chainLinkGeometry, metalMaterial);
                    chainLink2.position.set(0.6, 0.2, 0);
                    
                    const chainLink3 = new THREE.Mesh(chainLinkGeometry, metalMaterial);
                    chainLink3.position.set(0.6, 0.1, 0);
                    
                    prop.add(chainLink1);
                    prop.add(chainLink2);
                    prop.add(chainLink3);
                    break;
            }
            
            return prop;
        }
        
        // Update doll colors when color pickers change
        function updateDollColors() {
            if (!doll) return;
            
            const bodyColor = new THREE.Color(document.getElementById('bodyColor').value);
            const fabricColor = new THREE.Color(document.getElementById('fabricColor').value);
            const eyeColor = new THREE.Color(document.getElementById('eyeColor').value);
            
            // Update body color (first child is body)
            if (doll.children[0] && doll.children[0].material) {
                doll.children[0].material.color = bodyColor;
            }
            
            // Update fabric color (second child is fabric)
            if (doll.children[1] && doll.children[1].material) {
                doll.children[1].material.color = fabricColor;
            }
            
            // Update eye color (third child is eyes)
            if (doll.children[2] && doll.children[2].children) {
                const eyes = doll.children[2];
                for (let i = 0; i < eyes.children.length; i++) {
                    if (eyes.children[i].material) {
                        eyes.children[i].material.color = eyeColor;
                        // For glowing eyes, update emissive color too
                        if (eyes.children[i].material.emissive) {
                            eyes.children[i].material.emissive = eyeColor;
                        }
                    }
                }
            }
        }
        
        // Generate a batch of NFTs
        async function generateNFTBatch() {
            const count = parseInt(document.getElementById('generateCount').value);
            if (isNaN(count) || count < 1 || count > 10) {
                alert('Please enter a number between 1 and 10');
                return;
            }
            
            // Show progress bar
            document.getElementById('progressContainer').classList.remove('hidden');
            document.getElementById('progressText').textContent = `0/${count}`;
            document.getElementById('progressBar').style.width = '0%';
            
            // Clear previous downloads
            document.getElementById('downloadLinks').classList.add('hidden');
            document.getElementById('nftList').innerHTML = '';
            document.getElementById('metadataList').innerHTML = '';
            
            // Generate each NFT
            generatedNFTs = [];
            for (let i = 0; i < count; i++) {
                // Update progress
                document.getElementById('progressText').textContent = `${i+1}/${count}`;
                document.getElementById('progressBar').style.width = `${((i+1)/count)*100}%`;
                
                // Create random doll and get its attributes
                const attributes = createRandomDoll();
                
                // Export as GLTF
                const exporter = new THREE.GLTFExporter();
                const gltf = await new Promise(resolve => {
                    exporter.parse(doll, resolve, { binary: false });
                });
                
                // Create download links
                const dollId = `voodoo_doll_${currentDollId++}`;
                const gltfData = JSON.stringify(gltf, null, 2);
                const gltfBlob = new Blob([gltfData], { type: 'model/gltf+json' });
                const gltfUrl = URL.createObjectURL(gltfBlob);
                
                // Create metadata
                const metadata = {
                    name: `Voodoo Doll #${dollId}`,
                    description: "A unique 3D voodoo doll NFT generated with custom attributes",
                    image: `ipfs://${dollId}.png`,
                    attributes: [
                        { trait_type: "Background", value: attributes.background },
                        { trait_type: "Body Shape", value: attributes.bodyShape },
                        { trait_type: "Fabric", value: attributes.fabricType },
                        { trait_type: "Eyes", value: attributes.eyeType },
                        { trait_type: "Mouth", value: attributes.mouthType },
                        { trait_type: "Hat", value: attributes.hatType },
                        { trait_type: "Prop Theme", value: attributes.propTheme },
                        { trait_type: "Body Color", value: attributes.colors.body },
                        { trait_type: "Fabric Color", value: attributes.colors.fabric },
                        { trait_type: "Eye Color", value: attributes.colors.eyes }
                    ]
                };
                
                const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
                const metadataUrl = URL.createObjectURL(metadataBlob);
                
                // Store for download
                generatedNFTs.push({
                    id: dollId,
                    gltfUrl,
                    metadataUrl,
                    metadata
                });
                
                // Add to download lists
                const nftItem = document.createElement('div');
                nftItem.className = 'flex items-center justify-between';
                nftItem.innerHTML = `
                    <span>${dollId}.gltf</span>
                    <a href="${gltfUrl}" download="${dollId}.gltf" class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm">Download</a>
                `;
                document.getElementById('nftList').appendChild(nftItem);
                
                const metadataItem = document.createElement('div');
                metadataItem.className = 'flex items-center justify-between';
                metadataItem.innerHTML = `
                    <span>${dollId}.json</span>
                    <a href="${metadataUrl}" download="${dollId}.json" class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm">Download</a>
                `;
                document.getElementById('metadataList').appendChild(metadataItem);
                
                // Small delay to allow UI to update
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Show download links
            document.getElementById('downloadLinks').classList.remove('hidden');
        }
        
        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', init);
