function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
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

async function main() {
    var canvas = document.getElementById("renderCanvas");

    var startRenderLoop = function (engine, canvas) {
      engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
          sceneToRender.render();
        }
      });
    };

    var engine = null;
    var scene = null;
    var sceneToRender = null;
    var createDefaultEngine = function () {
      return new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        disableWebGL2Support: false,
      });
    };
    var createScene = function () {
      //-------------------------------------------------------------------------------------------------------
      // Scene creation
      var scene = new BABYLON.Scene(engine);

      // This creates and positions a free camera
      var camera = new BABYLON.FreeCamera(
        "camera1",
        new BABYLON.Vector3(0, 5, -10),
        scene
      );

      // Lighting
      new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene
      ).intensity = 0.7;
      var light2 = new BABYLON.DirectionalLight(
        "dir01",
        new BABYLON.Vector3(0.25, -1, 0.5),
        scene
      );
      light2.position = new BABYLON.Vector3(0, 10, 0);

      // Shadows
      var shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);
      shadowGenerator.useBlurExponentialShadowMap = true;

      // initialize physics plugin
      var hk = new BABYLON.HavokPlugin();
      scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

      // Mandatory ground
      var ground = BABYLON.MeshBuilder.CreateGround(
        "ground",
        { width: 10, height: 10 },
        scene
      );
      var groundAggregate = new BABYLON.PhysicsAggregate(
        ground,
        BABYLON.PhysicsShapeType.BOX,
        { mass: 0 },
        scene
      );
      const groundMaterial = new BABYLON.StandardMaterial("ground");
      groundMaterial.diffuseTexture = new BABYLON.Texture(
        "https://raw.githubusercontent.com/CedricGuillemet/dump/master/Ground_1mx1m.png"
      );
      groundMaterial.diffuseTexture.vScale = 5;
      groundMaterial.diffuseTexture.uScale = 5;
      ground.material = groundMaterial;

      var f = new BABYLON.Vector4(0.5, 0, 1, 1);
      var b = new BABYLON.Vector4(0, 0, 0.5, 1);
      var card = BABYLON.MeshBuilder.CreatePlane(
        "plane",
        {
          height: 1,
          width: 0.665,
          sideOrientation: BABYLON.Mesh.DOUBLESIDE,
          frontUVs: f,
          backUVs: b,
        },
        scene
      );
      card.position.y = 40;
      var mat = new BABYLON.StandardMaterial("", scene);
      mat.diffuseTexture = new BABYLON.Texture(
        "assets/ninediamond.jpg",
        scene
      );
      card.material = mat;

      var cardAggregate = new BABYLON.PhysicsAggregate(
        card,
        BABYLON.PhysicsShapeType.BOX,
        { mass: 10 },
        scene
      );

      //-------------------------------------------------------------------------------------------------------
      // Game State and debug

      camera.setTarget(new BABYLON.Vector3(0, 0, 0));
      var inputVelocity = new BABYLON.Vector3(0, 0, 0);
      var time = 0;
      var falling = false;
      var platformHook = null;

      //-------------------------------------------------------------------------------------------------------
      // Game loop
      scene.onBeforeAnimationsObservable.add(() => {
        // get camera world direction and right vectors. Character will move in camera space.
        var cameraDirection = camera.getDirection(
          new BABYLON.Vector3(0, 0, 1)
        );
        cameraDirection.y = 0;
        cameraDirection.normalize();
        var cameraRight = camera.getDirection(new BABYLON.Vector3(1, 0, 0));
        cameraRight.y = 0;
        cameraRight.normalize();

        var linearVelocity = new BABYLON.Vector3(0, 0, 0);
      });

      return scene;
    };
    window.initFunction = async function () {
      globalThis.HK = await HavokPhysics();

      var asyncEngineCreation = async function () {
        try {
          return createDefaultEngine();
        } catch (e) {
          console.log(
            "the available createEngine function failed. Creating the default engine instead"
          );
          return createDefaultEngine();
        }
      };

      window.engine = await asyncEngineCreation();
      if (!engine) throw "engine should not be null.";
      startRenderLoop(engine, canvas);
      window.scene = createScene();
    };
    initFunction().then(() => {
      sceneToRender = scene;
    });

    // Resize
    window.addEventListener("resize", function () {
      engine.resize();
    });
}

export { loadBabylonScripts, main };