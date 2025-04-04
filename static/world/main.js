window.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true);

    const createScene = function () {
        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3(0.9, 0.9, 1.0);

        const camera = new BABYLON.ArcRotateCamera("ArcCamera", Math.PI / 2, Math.PI / 3, 15, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);
        light.intensity = 1;

        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 20}, scene);
        ground.material = new BABYLON.StandardMaterial("groundMat", scene);
        ground.material.diffuseColor = new BABYLON.Color3(1, 1, 1);

        // NPC 안내 텍스트
        const npcText = BABYLON.MeshBuilder.CreatePlane("npcText", {width: 4, height: 2}, scene);
        npcText.position.set(0, 2, -5);
        const npcMat = new BABYLON.StandardMaterial("npcMat", scene);
        npcMat.diffuseTexture = new BABYLON.DynamicTexture("npcTextTex", {width:512, height:256}, scene, false);
        npcText.material = npcMat;
        const ctx = npcMat.diffuseTexture.getContext();
        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("GPT NPC: 거래 방법을 알려드릴게요!", 10, 100);
        npcMat.diffuseTexture.update();

        // GLB 오브젝트 로드
        BABYLON.SceneLoader.Append("assets/", "avatar.glb", scene, function () {
            console.log("GLB 로드 완료");
        });

        return scene;
    };

    const scene = createScene();
    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());
});
