function loadHTML() {
  const canvasZone = document.createElement("div");
  canvasZone.id = "canvasZone";

  const renderCanvas = document.createElement("canvas");
  renderCanvas.id = "renderCanvas";

  canvasZone.appendChild(renderCanvas);
  document.body.appendChild(canvasZone);
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function loadStyleSheet() {
  const styleElement = document.createElement("style");
  document.head.appendChild(styleElement);
  const sheet = styleElement.sheet;
  sheet.insertRule("html, body { overflow: hidden; width: 100%; height: 100%; margin: 0; padding: 0; }", sheet.cssRules.length);
  sheet.insertRule("#renderCanvas { width: 100%; height: 100%; touch-action: none; }", sheet.cssRules.length);
  sheet.insertRule("#canvasZone { width: 100%; height: 100%; }", sheet.cssRules.length);
}

async function loadBabylonScripts() {
    const scripts = [
        "https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.6.2/dat.gui.min.js",
        "https://assets.babylonjs.com/generated/Assets.js",
        "https://cdn.babylonjs.com/recast.js",
        "https://cdn.babylonjs.com/ammo.js",
        "https://cdn.babylonjs.com/havok/HavokPhysics_umd.js",
        "https://cdn.babylonjs.com/cannon.js",
        "https://cdn.babylonjs.com/Oimo.js",
        "https://cdn.babylonjs.com/earcut.min.js",
        "https://cdn.babylonjs.com/babylon.js",
        "https://cdn.babylonjs.com/materialsLibrary/babylonjs.materials.min.js",
        "https://cdn.babylonjs.com/proceduralTexturesLibrary/babylonjs.proceduralTextures.min.js",
        "https://cdn.babylonjs.com/postProcessesLibrary/babylonjs.postProcess.min.js",
        "https://cdn.babylonjs.com/loaders/babylonjs.loaders.js",
        "https://cdn.babylonjs.com/serializers/babylonjs.serializers.min.js",
        "https://cdn.babylonjs.com/gui/babylon.gui.min.js",
        "https://cdn.babylonjs.com/addons/babylonjs.addons.min.js",
        "https://cdn.babylonjs.com/inspector/babylon.inspector.bundle.js"
    ];

    for (const src of scripts) {
        await loadScript(src).catch((error) => {
            console.error(`Failed to load script: ${src}`, error);
        });
    }
}

function awsdarrowkey(camera) {
  /**
   * Arrow Up (38) and W (87)
   * Arrow Down (40) and S (83)
   * Arrow Left (37) and A (65)
   * Arrow Right (39) and D (68)
   */
  if(!camera) throw new Error("No Camera");

  camera.speed = 0.5; 
  camera.keysUp = [38, 87];   
  camera.keysDown = [40, 83];  
  camera.keysLeft = [37, 65];  
  camera.keysRight = [39, 68]; 
}

async function physicsInstance() {
    const havokInstance = await HavokPhysics();
    const hk = new BABYLON.HavokPlugin(true, havokInstance);
    if(!hk) throw Error("Failed calling Physics.")
    return hk;
}

async function startGame() {
  const canvas = document.getElementById("renderCanvas");

  if (!canvas) {
      console.error("Canvas not found!");
      return;
  }

  const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false,
  });
  
  if (!engine) {
      console.error("No Engine failed to initialize!");
      return;
  }

  const scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
  camera.attachControl(canvas, true);
  awsdarrowkey(camera);

  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

  var ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 10, height: 10 },
    scene
  );

  const groundMaterial = new BABYLON.StandardMaterial("ground");
  groundMaterial.diffuseTexture = new BABYLON.Texture(
    "https://raw.githubusercontent.com/CedricGuillemet/dump/master/Ground_1mx1m.png"
  );
  groundMaterial.diffuseTexture.vScale = 5;
  groundMaterial.diffuseTexture.uScale = 5;
  ground.material = groundMaterial;

  //Card1
  var f = new BABYLON.Vector4(0.5, 0, 1, 1);
  var b = new BABYLON.Vector4(0, 0, 0.5, 1);
  var card = BABYLON.MeshBuilder.CreatePlane("card1", { height: 1, width: 0.665, sideOrientation: BABYLON.Mesh.DOUBLESIDE, frontUVs: f, backUVs: b, }, scene);
  card.position.y = 40;
  var mat = new BABYLON.StandardMaterial("", scene);
  mat.diffuseTexture = new BABYLON.Texture(
    "assets/ninediamond.jpg",
    scene
  );
  card.material = mat;
  
  /*
  ** Before game loop
  */
  const hk = await physicsInstance();
  scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

  /**
  * Assign Physics to Objects
  */
  var groundAggregate = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);
  var cardAggregate = new BABYLON.PhysicsAggregate(card, BABYLON.PhysicsShapeType.BOX, { mass: 10 }, scene);

  engine.runRenderLoop(() => {
      scene.render();
  });

  window.addEventListener("resize", () => {
      engine.resize();
  });
}

export { loadHTML, loadStyleSheet, loadBabylonScripts, startGame };