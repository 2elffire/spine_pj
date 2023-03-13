var spineDemos = {
   HOVER_COLOR_INNER: new spine.Color(0, 0, 0, 0.0),
   HOVER_COLOR_OUTER: new spine.Color(0, 0, 0, 0.0),
   NON_HOVER_COLOR_INNER: new spine.Color(0, 0, 0, 0.0),
   NON_HOVER_COLOR_OUTER: new spine.Color(0, 0, 0, 0.0),
   demos: [],
   loopRunning: false,
   canvases: [],
   downloader: new spine.Downloader(),
   path: "assets/"
};

// window.onerror = function (msg, url, lineNo, columnNo, error) {
//    var string = msg.toLowerCase();
//    var substring = "script error";
//    if (string.indexOf(substring) > -1)
//       alert('Script Error: See Browser Console for Detail');
//    else {
//       var message = [
//          'Message: ' + msg,
//          'URL: ' + url,
//          'Line: ' + lineNo,
//          'Column: ' + columnNo,
//          'Error object: ' + JSON.stringify(error)
//       ].join(' - ');
//
//       alert(message);
//    }
//    return false;
// };

(function () {
   var timeKeeper = new spine.TimeKeeper();
   function loop() {
      timeKeeper.update();
      if (spineDemos.log) console.log(timeKeeper.delta + ", " + timeKeeper.framesPerSecond);
      requestAnimationFrame(loop);
      var demos = spineDemos.demos;
      for (var i = 0; i < demos.length; i++) {
         var demo = demos[i];
         checkElementVisible(demo);
         renderDemo(demo);
      }
   }

   function renderDemo(demo) {
      if (demo.visible) {
         var canvas = demo.canvas;

         if (canvas.parentElement != demo.placeholder) {
            $(canvas).detach();
            demo.placeholder.appendChild(canvas);
         }
         let complete = demo.assetManager.isLoadingComplete();
         if (complete) {
            if (!demo.loaded) {
               demo.loaded = true;
               demo.loadingComplete();
            }
            if (spineDemos.log) console.log("Rendering: " + canvas.id);
            demo.render();
         }
         demo.loadingScreen.draw(complete);
      }
   }

   function checkElementVisible(demo) {
      const rect = demo.placeholder.getBoundingClientRect();
      const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
      const windowWidth = (window.innerWidth || document.documentElement.clientWidth);
      const vertInView = (rect.top <= windowHeight * 1.1) && ((rect.top + rect.height) >= windowHeight * -0.1);
      const horInView = (rect.left <= windowWidth * 1.1) && ((rect.left + rect.width) >= windowWidth * -0.1);

      demo.visible = (vertInView && horInView);
   }

   function createCanvases(numCanvases) {
      for (var i = 0; i < numCanvases; i++) {
         var canvas = document.createElement("canvas");

         canvas.width = 0; canvas.height = 0;
         // canvas.context = new spine.ManagedWebGLRenderingContext(canvas, { alpha: true });
         canvas.context = new spine.ManagedWebGLRenderingContext(canvas, { alpha: true, premultipliedAlpha: false });
         canvas.id = "canvas-" + i;
         canvas.style.cssText = `
           position: absolute;
           visibility:hidden;`
         spineDemos.canvases.push(canvas);
      }
   }

   spineDemos.init = function () {
      var numCanvases = 5;
      var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
      if (isFirefox && isAndroid) numCanvases = 2;
      createCanvases(numCanvases);

      requestAnimationFrame(loop);

   }

   spineDemos.addDemo = function (demo, placeholder) {
      var canvas = spineDemos.canvases[spineDemos.demos.length % spineDemos.canvases.length];
      demo(canvas);
      demo.placeholder = placeholder;
      demo.canvas = canvas;
      demo.visible = false;
      var renderer = new spine.SceneRenderer(canvas, canvas.context.gl);
      demo.loadingScreen = new spine.LoadingScreen(renderer);

      $(window).on('DOMContentLoaded load resize scroll', function () {
         checkElementVisible(demo);
         renderDemo(demo);
      });
      checkElementVisible(demo);
      spineDemos.demos.push(demo);
   }

   var coords = new spine.Vector3();
   var mouse = new spine.Vector3();
   spineDemos.closest = function (canvas, renderer, skeleton, controlBones, hoverTargets, x, y) {
      mouse.set(x, canvas.clientHeight - y, 0)
      var bestDistance = 50, index = 0;
      var best;
      for (var i = 0; i < controlBones.length; i++) {
         hoverTargets[i] = null;
         let bone = skeleton.findBone(controlBones[i]);
         var position = new spine.Vector2(bone.length, 0);
         bone.localToWorld(position);
         let distance = renderer.camera.worldToScreen(
            coords.set(bone.worldX, bone.worldY, 0),
            canvas.clientWidth, canvas.clientHeight).distance(mouse);
         if (distance < bestDistance) {
            bestDistance = distance;
            best = bone;
            index = i;
         }
      }
      if (best) hoverTargets[index] = best;
      return best;
   };

   var position = new spine.Vector3();
   spineDemos.dragged = function (canvas, renderer, target, x, y) {
      if (target) {
         x = spine.MathUtils.clamp(x, 0, canvas.clientWidth)
         y = spine.MathUtils.clamp(y, 0, canvas.clientHeight);
         renderer.camera.screenToWorld(coords.set(x, y, 0), canvas.clientWidth, canvas.clientHeight);
         if (target.parent !== null) {
            target.parent.worldToLocal(position.set(coords.x, coords.y));
            target.x = position.x;
            target.y = position.y;
         } else {
            target.x = coords.x;
            target.y = coords.y;
         }
      }
   };


})();
