var vineDemo2 = function (canvas, bgColor) {
	var COLOR_INNER = new spine.Color(0.0, 0, 0, 0.0);
	var COLOR_OUTER = new spine.Color(0.0, 0, 0, 0.0);
	var COLOR_INNER_SELECTED = new spine.Color(0.0, 0, 0.0, 0.0);
	var COLOR_OUTER_SELECTED = new spine.Color(0.0, 0, 0.0, 0.0);

	var canvas, gl, renderer, input, assetManager;
	var skeleton, state, bounds, position;
	var target = null;
	var hoverTargets = [null, null, null, null, null, null, null];
	var controlBones = [
		// "bone",
		"bone2", "bone3", "bone4", "bone5"
		,	"bone6", "bone7", "bone8", "bone9"
		,	"bone10", "bone11", "bone12",	"bone13"
		, "bone14"
		, "bone15"
		,	"bone16", "bone17", "bone18",	"bone19"
		, "bone20", "bone21", "bone22", "bone23",	"bone24", "bone25", "bone26"
		, "middlebone1", "middlebone2", "middlebone3", "middlebone4", "middlebone5", "middlebone6", "middlebone7", "middlebone8", "middlebone9", "middlebone10"
		,	"bone27", "bone28", "bone29"
		,	"bone30", "bone31", "bone32"
		// , "bone33", "bone34",	"bone35", "bone36", "bone37",	"bone38", "bone39"
		// , "bone40",	"bone41", "bone42", "bone43", "bone44", "bone45",	"bone46", "bone47", "bone48",	"bone49"
		// , "bone50",	"bone51", "bone52", "bone53", "bone54", "bone55",	"bone56", "bone57", "bone58",	"bone59"
		// , "bone60",	"bone61", "bone62", "bone63"
		// , "bone64", "bone65",	"bone66", "bone67", "bone68",	"bone69"
		// , "bone70",	"bone71", "bone72", "bone73", "bone74", "bone75",	"bone76", "bone77", "bone78",	"bone79"
		// , "bone80"
		// ,	"bone81", "bone82", "bone83", "bone84", "bone85",	"bone86", "bone87", "bone88",	"bone89"
		// , "bone90",	"bone91", "bone92", "bone93", "bone94", "bone95",	"bone96", "bone97", "bone98",	"bone99"
		// , "bone100",	"bone101", "bone102", "bone103", "bone104", "bone105",	"bone106", "bone107", "bone108",	"bone109"
		// , "bone110",	"bone111", "bone112", "bone113", "bone114", "bone115",	"bone116", "bone117"
		// , "bone120",	"bone121", "bone122", "bone123", "bone124", "bone125",	"bone126", "bone127", "bone128",	"bone129"
		// , "bone130",	"bone131", "bone132", "bone133", "bone134", "bone135",	"bone136", "bone137", "bone138",	"bone139"
		// , "bone140",	"bone141", "bone142", "bone143", "bone144", "bone145",	"bone146", "bone147"
		// , "bone148",	"bone149"

	];
	var coords = new spine.Vector3(), temp = new spine.Vector3(), temp2 = new spine.Vector2();
	// var playButton, timeLine, isPlaying = false, playTime = 5;

	bgColor = new spine.Color(0, 0, 0, 0);
	canvas.context = new spine.ManagedWebGLRenderingContext(canvas, { alpha: true, premultipliedAlpha: false });

	function init() {
		gl = canvas.context.gl;
		renderer = new spine.SceneRenderer(canvas, gl);
		input = new spine.Input(canvas);
		assetManager = new spine.AssetManager(gl, spineDemos.path, spineDemos.downloader);

		assetManager.loadTextureAtlas("skeleton2.atlas");
		assetManager.loadJson("skeleton2.json");

	}

	function loadingComplete() {

		var atlasLoader = new spine.AtlasAttachmentLoader(assetManager.get("skeleton2.atlas"));
		var skeletonJson = new spine.SkeletonJson(atlasLoader);
		var skeletonData = skeletonJson.readSkeletonData(assetManager.get("skeleton2.json"));
		skeleton = new spine.Skeleton(skeletonData);
		skeleton.setToSetupPose();
		skeleton.updateWorldTransform();
		var offset = new spine.Vector2();
		bounds = new spine.Vector2();

		skeleton.getBounds(offset, bounds, []);
		skeleton.updateWorldTransform();

		skeleton.color = { r: 0.2, g: 0.2, b: 0.2, a: 1 };



		renderer.camera.position.x = offset.x + bounds.x / 2;
		renderer.camera.position.y = offset.y + bounds.y / 2;

		renderer.skeletonDebugRenderer.drawMeshHull = false;
		renderer.skeletonDebugRenderer.drawMeshTriangles = false;

		setupUI();
		setupInput();

	}

	function setupUI() {

		renderer.skeletonDebugRenderer.drawPaths = false;
		renderer.skeletonDebugRenderer.drawBones = false;
	}

	function setupInput() {


		input.addListener({
			down: function (x, y) {
				target = spineDemos.closest(canvas, renderer, skeleton, controlBones, hoverTargets, x, y);
			},
			up: function (x, y) {
				target = null;
			},
			dragged: function (x, y) {
				spineDemos.dragged(canvas, renderer, target, x, y);
			},
			moved: function (x, y) {
				spineDemos.closest(canvas, renderer, skeleton, controlBones, hoverTargets, x, y);
			}
		});
	}

	function render() {


		skeleton.updateWorldTransform();

		renderer.camera.viewportWidth = bounds.x * 1.2;
		renderer.camera.viewportHeight = bounds.y * 1.2;
		renderer.resize(spine.ResizeMode.Fit);


		gl.clearColor(bgColor.r, bgColor.g, bgColor.b, bgColor.a);


		gl.clear(gl.COLOR_BUFFER_BIT);


		renderer.begin();
		renderer.drawSkeleton(skeleton, true);
		renderer.drawSkeletonDebug(skeleton);
		gl.lineWidth(2);
		for (var i = 0; i < controlBones.length; i++) {
			var bone = skeleton.findBone(controlBones[i]);

			var colorInner = hoverTargets[i] !== null ? spineDemos.HOVER_COLOR_INNER : spineDemos.NON_HOVER_COLOR_INNER;
			var colorOuter = hoverTargets[i] !== null ? spineDemos.HOVER_COLOR_OUTER : spineDemos.NON_HOVER_COLOR_OUTER;
			renderer.circle(true, skeleton.x + bone.worldX, skeleton.y + bone.worldY, 20, colorInner);
			renderer.circle(false, skeleton.x + bone.worldX, skeleton.y + bone.worldY, 20, colorOuter);
		}
		gl.lineWidth(1);
		renderer.end();
	}

	init();
	vineDemo2.assetManager = assetManager;
	vineDemo2.loadingComplete = loadingComplete;
	vineDemo2.render = render;
};
