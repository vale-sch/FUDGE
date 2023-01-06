namespace PhysicsVR {
    import f = FudgeCore;
    f.RenderWebGL.initialize(false, true);
    let xrViewport: f.XRViewport = new f.XRViewport();
    let graph: f.Graph = null;
    let camera: f.ComponentVRDevice = null;

    window.addEventListener("load", init);

    async function init() {
        await FudgeCore.Project.loadResources("Internal.json");
        graph = <f.Graph>f.Project.resources[document.head.querySelector("meta[autoView]").getAttribute("autoView")];
        FudgeCore.Debug.log("Graph:", graph);
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector("canvas");
        camera = graph.getChildrenByName("Camera")[0].getComponent(f.ComponentVRDevice);
        xrViewport.clearColor = false;

        xrViewport.initialize("Viewport", graph, camera, canvas);
        f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
        f.Loop.start(f.LOOP_MODE.FRAME_REQUEST, 60);

        checkForVRSupport();
    }

    // check device/browser capabilities for VR Session 
    function checkForVRSupport(): void {
        navigator.xr.isSessionSupported(f.XR_SESSION_MODE.IMMERSIVE_AR).then((supported: boolean) => {
            if (supported)
                setupVR();
            else
                console.log("Session not supported");
        });
    }
    //main function to start VR Session
    function setupVR(): void {


        //create XR Button -> Browser  //!important: look up the css file.
        let enterXRButton: HTMLButtonElement = document.createElement("button");
        enterXRButton.id = "xrButton";
        enterXRButton.innerHTML = "Enter VR";
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
        }
        );
    }

    function update(_event: Event): void {
        xrViewport.draw();
    }



    function onEndSession(): void {
        f.Loop.stop();
        f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);
    }
}

