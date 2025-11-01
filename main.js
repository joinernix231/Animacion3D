// Variables globales
let scene, camera, renderer, controls;
let planets = [];  // ya no la uso mucho pero la dejé por si acaso
let planetData = [];
let animationSpeed = 1;
let showOrbits = true;
let showNames = true;

// TODO: agregar más planetas enanos después si hay tiempo
// const planetasEnanos = [];

// Datos de los planetas
const planetInformation = {
    sol: {
        name: "Sol",
        description: "El Sol es la estrella central de nuestro sistema solar. Es una esfera casi perfecta de plasma caliente, con campos magnéticos que generan energía mediante fusión nuclear. Representa el 99.86% de la masa total del sistema solar."
    },
    mercurio: {
        name: "Mercurio",
        description: "Mercurio es el planeta más cercano al Sol y el más pequeño del sistema solar. Tiene temperaturas extremas, desde 427°C durante el día hasta -173°C por la noche. No tiene atmósfera significativa."
    },
    venus: {
        name: "Venus",
        description: "Venus es el planeta más caliente del sistema solar debido a su densa atmósfera de dióxido de carbono que crea un efecto invernadero extremo. Es similar en tamaño a la Tierra pero inhóspito para la vida."
    },
    tierra: {
        name: "Tierra",
        description: "La Tierra es nuestro hogar y el único planeta conocido con vida. Tiene agua líquida, una atmósfera protectora y un campo magnético. Es el tercer planeta desde el Sol y tiene una luna."
    },
    marte: {
        name: "Marte",
        description: "Marte, conocido como el planeta rojo, tiene una superficie con evidencias de agua pasada. Tiene dos pequeñas lunas, Fobos y Deimos. Es uno de los objetivos principales para la exploración humana."
    },
    jupiter: {
        name: "Júpiter",
        description: "Júpiter es el planeta más grande del sistema solar, una gigante gaseosa. Tiene una Gran Mancha Roja, una tormenta más grande que la Tierra que lleva siglos activa. Tiene más de 79 lunas conocidas."
    },
    saturno: {
        name: "Saturno",
        description: "Saturno es famoso por sus anillos visibles compuestos principalmente de hielo y roca. Es la segunda gigante gaseosa más grande. Tiene 82 lunas conocidas, incluyendo Titán, una de las lunas más interesantes del sistema solar."
    },
    urano: {
        name: "Urano",
        description: "Urano es un gigante de hielo que gira de lado, con su eje de rotación inclinado casi 98 grados. Tiene un sistema de anillos y 27 lunas conocidas. Su atmósfera contiene metano que le da su color azul verdoso."
    },
    neptuno: {
        name: "Neptuno",
        description: "Neptuno es el planeta más lejano del Sol y tiene los vientos más fuertes del sistema solar, alcanzando hasta 2,100 km/h. Es un gigante de hielo con una atmósfera dinámica y 14 lunas conocidas, incluyendo Tritón."
    }
};

// Inicialización
function init() {
    // Crear escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);

    // Crear cámara
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );
    camera.position.set(0, 50, 150);

    // Crear renderer
    const canvas = document.getElementById('scene');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Controles de órbita
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 30;
    controls.maxDistance = 500;

    // Iluminación
    // Luz ambiente
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Luz direccional (simulando luz solar)
    const sunLight = new THREE.PointLight(0xffffff, 2, 2000);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Estrellas de fondo
    createStars();

    // Crear el Sol
    createSun();

    // Crear planetas
    createPlanets();

    // Event listeners (debe ir antes de createLabelOverlays para que showNames esté disponible)
    setupEventListeners();

    // Crear etiquetas overlay (después de crear planetas)
    createLabelOverlays();

    // Iniciar animación
    animate();
}

// Crear estrellas de fondo
function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
    
    const starsVertices = [];
    // probé con 5000 pero se veía muy vacío, 10000 es mejor
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // intenté hacerlas parpadear pero era muy complicado, mejor así
}

// Crear el Sol
function createSun() {
    // el sol tiene que ser más grande que los planetas obviamente
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,  // amarillo básico
        emissive: 0xffff00,
        emissiveIntensity: 0.5  // probé con 1.0 pero se veía muy fuerte
    });
    const sun = new THREE.Mesh(geometry, material);
    sun.name = "sol";
    scene.add(sun);
    
    // efecto de brillo que encontré en un tutorial, quedó bien
    const sunGlow = new THREE.Mesh(
        new THREE.SphereGeometry(5.5, 32, 32),
        new THREE.MeshBasicMaterial({ 
            color: 0xffaa00, 
            transparent: true, 
            opacity: 0.3 
        })
    );
    sun.add(sunGlow);
}

// Crear planetas
function createPlanets() {
    const planetsConfig = [
        { name: 'mercurio', distance: 15, size: 0.8, color: 0x8c7853, speed: 0.04, info: planetInformation.mercurio },
        { name: 'venus', distance: 22, size: 0.95, color: 0xffc649, speed: 0.035, info: planetInformation.venus },
        { name: 'tierra', distance: 30, size: 1, color: 0x6b93d6, speed: 0.03, info: planetInformation.tierra },
        { name: 'marte', distance: 45, size: 0.75, color: 0xc1440e, speed: 0.025, info: planetInformation.marte },
        { name: 'jupiter', distance: 65, size: 2.5, color: 0xd8ca9d, speed: 0.015, info: planetInformation.jupiter },
        { name: 'saturno', distance: 85, size: 2.2, color: 0xfad5a5, speed: 0.012, info: planetInformation.saturno },
        { name: 'urano', distance: 105, size: 1.8, color: 0x4fd0e7, speed: 0.01, info: planetInformation.urano },
        { name: 'neptuno', distance: 125, size: 1.7, color: 0x4b70dd, speed: 0.008, info: planetInformation.neptuno }
    ];

    planetsConfig.forEach((config, index) => {
        // crear la geometría del planeta
        const geometry = new THREE.SphereGeometry(config.size, 32, 32);
        // MeshPhongMaterial se ve más realista que BasicMaterial
        const material = new THREE.MeshPhongMaterial({ 
            color: config.color,
            shininess: 30,  // probé con 50 pero era mucho
            specular: 0x222222
        });
        const planet = new THREE.Mesh(geometry, material);
        planet.position.x = config.distance;
        planet.name = config.name;
        planet.castShadow = true;
        planet.receiveShadow = true;
        
        scene.add(planet);
        
        // console.log('Planeta creado:', config.name); // debug
        
        // Órbita
        const orbitGeometry = new THREE.RingGeometry(config.distance - 0.1, config.distance + 0.1, 64);
        const orbitMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x444444, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = -Math.PI / 2;
        orbit.name = config.name + '-orbit';
        scene.add(orbit);

        // etiquetas las hago después con HTML porque CSS3D me dio problemas
        // al final funcionó mejor así

        // Guardar datos del planeta
        planetData.push({
            mesh: planet,
            orbit: orbit,
            label: null, // Se manejará con HTML overlay
            distance: config.distance,
            speed: config.speed,
            angle: (index * Math.PI / 4), // Distribuir planetas en diferentes ángulos
            info: config.info,
            name: config.info.name
        });
    });

    // los anillos de saturno son especiales, tuve que hacerlos aparte
    const saturnOrbit = planetData.find(p => p.mesh.name === 'saturno');
    if (saturnOrbit) {
        const ringGeometry = new THREE.RingGeometry(2.4, 3.2, 64);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: 0xc9a961,  // color dorado
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7  // probé 0.5 y 0.9, este está bien
        });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;  // rotar para que se vean desde arriba
        rings.position.set(saturnOrbit.distance, 0, 0);
        rings.name = 'saturno-rings';
        scene.add(rings);
        saturnOrbit.rings = rings;
    }
}

// Actualizar posición de los planetas (animación)
function updatePlanets() {
    planetData.forEach(planet => {
        // actualizar el ángulo de la órbita
        planet.angle += planet.speed * animationSpeed;
        
        // fórmulas de trigonometría para movimiento circular
        // aprendí esto en clases de física xd
        planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
        planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
        
        // rotación del planeta sobre su propio eje
        planet.mesh.rotation.y += 0.01 * animationSpeed;
        
        // las etiquetas las manejo aparte con HTML
        
        // los anillos de saturno también rotan
        if (planet.rings) {
            planet.rings.position.copy(planet.mesh.position);
            planet.rings.rotation.z += 0.001 * animationSpeed;
        }
    });
}

// Configurar event listeners
function setupEventListeners() {
    // control de velocidad
    const speedControl = document.getElementById('speed-control');
    const speedValue = document.getElementById('speed-value');
    
    speedControl.addEventListener('input', (e) => {
        animationSpeed = parseFloat(e.target.value);
        speedValue.textContent = animationSpeed.toFixed(1) + 'x';
    });
    
    // probé hacer que se pause pero quedó muy complicado, mejor así

    // Mostrar/ocultar órbitas
    const showOrbitsCheckbox = document.getElementById('show-orbits');
    showOrbitsCheckbox.addEventListener('change', (e) => {
        showOrbits = e.target.checked;
        planetData.forEach(planet => {
            planet.orbit.visible = showOrbits;
        });
    });

    // Mostrar/ocultar nombres
    const showNamesCheckbox = document.getElementById('show-names');
    showNamesCheckbox.addEventListener('change', (e) => {
        showNames = e.target.checked;
        // Actualizar visibilidad de etiquetas HTML si se implementan
        updateLabelVisibility();
    });

    // detección de clics en planetas usando raycasting
    // esto lo tuve que buscar porque no sabía cómo hacerlo
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    renderer.domElement.addEventListener('click', (event) => {
        // convertir coordenadas del mouse a coordenadas normalizadas
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        
        // obtener todos los meshes de los planetas
        const meshes = planetData.map(p => p.mesh);
        const intersects = raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const clickedPlanet = planetData.find(p => p.mesh === intersects[0].object);
            if (clickedPlanet) {
                showPlanetInfo(clickedPlanet.info);
            }
        }
        // también probé hacer que el sol muestre info pero decidí que no tenía sentido
    });

    // Cerrar panel de información
    document.getElementById('close-btn').addEventListener('click', () => {
        document.getElementById('info-panel').classList.add('hidden');
    });

    // Ajustar tamaño al redimensionar ventana
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Mostrar información del planeta
function showPlanetInfo(info) {
    document.getElementById('planet-name').textContent = info.name;
    document.getElementById('planet-description').textContent = info.description;
    document.getElementById('info-panel').classList.remove('hidden');
}

// Actualizar visibilidad de etiquetas
function updateLabelVisibility() {
    labelElements.forEach(label => {
        label.style.display = showNames ? 'block' : 'none';
    });
}

// función que intenté hacer para hacer zoom automático a un planeta
// pero al final no la usé porque era muy complicado
/*
function zoomToPlanet(planetName) {
    const planet = planetData.find(p => p.name === planetName);
    if (planet) {
        // código incompleto...
    }
}
*/

// Crear y actualizar etiquetas HTML overlay
let labelElements = [];

function createLabelOverlays() {
    const container = document.getElementById('container');
    
    // limpiar etiquetas si ya existen (por si acaso)
    labelElements.forEach(label => label.remove());
    labelElements = [];
    
    planetData.forEach(planet => {
        const label = document.createElement('div');
        label.className = 'planet-label-overlay';
        label.textContent = planet.name;
        label.dataset.planetName = planet.mesh.name;
        label.style.display = showNames ? 'block' : 'none';
        container.appendChild(label);
        labelElements.push(label);
    });
    
    // console.log('Etiquetas creadas:', labelElements.length); // debug
}

function updateLabelOverlays() {
    if (!showNames) {
        labelElements.forEach(label => label.style.display = 'none');
        return;
    }
    
    planetData.forEach((planet, index) => {
        if (labelElements[index]) {
            const label = labelElements[index];
            label.style.display = 'block';
            
            // proyectar la posición 3D a coordenadas 2D de pantalla
            // esto fue lo más difícil de hacer funcionar bien
            const vector = planet.mesh.position.clone();
            vector.y += planet.mesh.geometry.parameters.radius + 2;  // ponerlo un poco arriba del planeta
            vector.project(camera);
            
            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = (vector.y * -0.5 + 0.5) * window.innerHeight;
            
            // solo mostrar si el planeta está frente a la cámara
            if (vector.z > 0 && vector.z < 1) {
                label.style.left = x + 'px';
                label.style.top = y + 'px';
                label.style.opacity = '1';
            } else {
                label.style.opacity = '0';  // ocultar si está detrás
            }
        }
    });
}

// Loop de animación
function animate() {
    requestAnimationFrame(animate);
    
    controls.update();
    updatePlanets();
    updateLabelOverlays();
    
    renderer.render(scene, camera);
}

// Inicializar cuando se carga la página
window.addEventListener('load', init);

