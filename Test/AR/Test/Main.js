var PhysicsVR;
(function (PhysicsVR) {
    var f = FudgeCore;
    f.RenderWebGL.initialize(false, true);
    let xrViewport = new f.XRViewport();
    let graph = null;
    let camera = null;
    let object = null;
    window.addEventListener("load", init);
    async function init() {
        await FudgeCore.Project.loadResources("Internal.json");
        graph = f.Project.resources[document.head.querySelector("meta[autoView]").getAttribute("autoView")];
        FudgeCore.Debug.log("Graph:", graph);
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        let canvas = document.querySelector("canvas");
        camera = graph.getChildrenByName("Camera")[0].getComponent(f.ComponentVRDevice);
        xrViewport.clearColor = false;
        object = graph.getChildrenByName("New Node")[0];
        xrViewport.initialize("Viewport", graph, camera, canvas);
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start(f.LOOP_MODE.FRAME_REQUEST, 60);
        checkForVRSupport();
    }
    // check device/browser capabilities for VR Session 
    function checkForVRSupport() {
        navigator.xr.isSessionSupported(f.XR_SESSION_MODE.IMMERSIVE_AR).then((supported) => {
            if (supported)
                setupVR();
            else
                console.log("Session not supported");
        });
    }
    //main function to start VR Session
    function setupVR() {
        //create XR Button -> Browser  //!important: look up the css file.
        let enterXRButton = document.createElement("button");
        enterXRButton.id = "xrButton";
        enterXRButton.innerHTML = "Enter AR";
        document.body.appendChild(enterXRButton);
        enterXRButton.addEventListener("click", async function () {
            //initalizes xr session 
            if (!xrViewport.session) {
                await xrViewport.initializeAR(f.XR_SESSION_MODE.IMMERSIVE_AR, f.XR_REFERENCE_SPACE.LOCAL);
                //triggers onEndSession function with user exits xr session
                xrViewport.session.addEventListener("end", onEndSession);
            }
            //stop normal loop of winodws.animationFrame
            f.Loop.stop();
            //starts xr-session.animationFrame instead of window.animationFrame, your xr-session is ready to go!
            f.Loop.start(f.LOOP_MODE.FRAME_REQUEST_XR, 60);
        });
    }
    function update(_event) {
        xrViewport.draw();
    }
    function onEndSession() {
        f.Loop.stop();
        f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);
    }
})(PhysicsVR || (PhysicsVR = {}));
//# sourceMappingURL=Main.js.map