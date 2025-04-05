window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.8, 0.9, 1.0); // 밝은 배경

    // 카메라 + WASD 이동
    const camera = new BABYLON.UniversalCamera("UniCam", new BABYLON.Vector3(0, 2, -5), scene);
    camera.attachControl(canvas, true);
    camera.speed = 0.2;

    // VR 모드 지원
    const xrHelperPromise = scene.createDefaultXRExperienceAsync({});

    // 조명
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1;

    // 바닥
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 20}, scene);
    ground.material = new BABYLON.StandardMaterial("groundMat", scene);
    ground.material.diffuseColor = new BABYLON.Color3(1, 1, 1);

    // 배경 스카이박스
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000}, scene);
    const skyMaterial = new BABYLON.StandardMaterial("skyMat", scene);
    skyMaterial.backFaceCulling = false;
    skyMaterial.disableLighting = true;
    skyMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.95, 1.0);
    skybox.material = skyMaterial;

    // GPT NPC 평면
    const npcPlane = BABYLON.MeshBuilder.CreatePlane("npcText", {width: 4, height: 2}, scene);
    npcPlane.position = new BABYLON.Vector3(0, 2, 0);
    const npcMat = new BABYLON.StandardMaterial("npcMat", scene);
    npcMat.diffuseTexture = new BABYLON.DynamicTexture("npcTextTex", {width:512, height:256}, scene, false);
    npcPlane.material = npcMat;
    const ctx = npcMat.diffuseTexture.getContext();
    ctx.font = "bold 26px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("GPT NPC: 클릭하면 대화 시작!", 10, 100);
    npcMat.diffuseTexture.update();

    // NPC 클릭 → GPT 대화 시작
    npcPlane.actionManager = new BABYLON.ActionManager(scene);
    npcPlane.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger,
        () => {
            const msg = prompt("GPT에게 질문하세요:");
            if (msg) {
                fetch("/gpt_test", {
                    method: "POST",
                    headers: {"Content-Type": "application/x-www-form-urlencoded"},
                    body: `message=${encodeURIComponent(msg)}`
                })
                .then(res => res.text())
                .then(reply => alert("GPT 응답: " + reply));
            }
        }
    ));

    // avatar.glb 로드
    BABYLON.SceneLoader.Append("/assets/", "avatar.glb", scene, function (scene) {
        const root = scene.meshes[scene.meshes.length - 1];
        root.position = new BABYLON.Vector3(3, 0, 0); // NPC에서 약간 떨어진 위치
        root.getChildMeshes().forEach(m => {
            if (m.material && m.material.albedoTexture) {
                m.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
                m.material.alpha = 0.9;
            }
        });
    });

    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());
});
