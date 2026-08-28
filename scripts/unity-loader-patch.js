// gullsgabage Unity WebGL loader patch — injected into the build's index.html
// by scripts/import-build.ts (marker: gullsgabage:unity-fix). Keep this file in
// sync with any changes made to the exported loader page.
//
// Why this patch exists
// ---------------------
// 1. The build auto-requests browser fullscreen at startup (PlayerSettings
//    fullscreenMode), and browsers deny fullscreen requests that are not
//    triggered by a user gesture — e.g. opening the game in a new tab. Unity
//    treats the denial ("TypeError: Fullscreen request denied") as a fatal
//    exception, kills the game loop and shows "An error occurred running the
//    Unity content on this page". Same crash can happen when the game
//    re-requests fullscreen after the tab regains focus, which also explains
//    players reporting a frozen gray canvas after leaving fullscreen and
//    switching tabs.
// 2. Browser fullscreen hijacks the Escape key: the browser always exits
//    fullscreen on Esc (security behavior that cannot be intercepted), so Esc
//    can never be a game command while real fullscreen is engaged.
//
// Fix
// ---
// Never touch the browser fullscreen API. Every fullscreen request becomes a
// CSS-only "fake fullscreen" (canvas fills the viewport). Nothing can be
// denied (no crash), the browser never consumes Esc (it stays a game command),
// and there are no real fullscreen transitions to leave a stale gray canvas.
// Unity's Screen.fullScreen bookkeeping is mirrored via a synthetic
// fullscreenchange event plus a document.fullscreenElement override, so the
// game's own fullscreen toggle (template ⛶ button, future pause menu) still
// works in both directions.
//
// Also: kick a repaint when the tab regains focus (Chrome sometimes leaves the
// canvas blank after a hidden tab), and reload the page once if the WebGL
// context is lost (this build has no context-restore path, so a lost context
// means a permanently gray canvas).
;(function () {
  'use strict'

  function init() {
    var canvas = document.querySelector('#unity-canvas')
    if (!canvas) return

    var container = canvas.parentElement
    var footer = document.getElementById('unity-footer')
    var fakeFullscreen = false
    var saved = null

    // The hosting site provides its own fullscreen control above the game —
    // remove the duplicate one from the Unity template footer.
    var fullscreenButton = document.getElementById('unity-fullscreen-button')
    if (fullscreenButton) fullscreenButton.style.display = 'none'

    function applyCssFullscreen() {
      if (saved || !container) return
      saved = {
        containerCss: container.style.cssText,
        canvasCss: canvas.style.cssText,
        containerClass: container.className,
        footerCss: footer ? footer.style.cssText : null,
      }
      container.style.cssText =
        'position:fixed;inset:0;width:100%;height:100%;margin:0;padding:0;' +
        'background:#000;z-index:2147483000;left:0;top:0;transform:none;'
      canvas.style.cssText =
        'width:100%;height:' + (footer ? 'calc(100% - 38px)' : '100%') + ';display:block;'
      if (footer) {
        footer.style.cssText =
          'position:fixed;left:0;right:0;bottom:0;height:38px;' +
          'z-index:2147483001;background:#000;'
      }
    }

    function restoreCss() {
      if (!saved) return
      container.style.cssText = saved.containerCss
      canvas.style.cssText = saved.canvasCss
      container.className = saved.containerClass
      if (footer) footer.style.cssText = saved.footerCss
      saved = null
    }

    function setFakeFullscreen(on) {
      fakeFullscreen = on
      if (on) applyCssFullscreen()
      else restoreCss()
      // Let Unity's C++ fullscreen state (Screen.fullScreen) follow the CSS
      // state, so its own fullscreen UI / toggle keeps working both ways.
      setTimeout(function () {
        document.dispatchEvent(new Event('fullscreenchange'))
        window.dispatchEvent(new Event('resize'))
      }, 0)
    }

    // Mirror the fake state into the document so Unity's fullscreen
    // bookkeeping (document.fullscreenElement, exitFullscreen) is coherent.
    function overrideGetter(name, getter) {
      try {
        Object.defineProperty(Document.prototype, name, {
          configurable: true,
          get: getter,
        })
        return true
      } catch {
        try {
          Object.defineProperty(document, name, {
            configurable: true,
            get: getter,
          })
          return true
        } catch {
          return false
        }
      }
    }
    overrideGetter('fullscreenElement', function () {
      return fakeFullscreen ? canvas : null
    })

    var elementProto = Element.prototype
    elementProto.requestFullscreen = function () {
      setFakeFullscreen(true)
      return Promise.resolve()
    }
    if (elementProto.webkitRequestFullscreen) {
      elementProto.webkitRequestFullscreen = function () {
        setFakeFullscreen(true)
      }
    }
    try {
      Document.prototype.exitFullscreen = function () {
        setFakeFullscreen(false)
        return Promise.resolve()
      }
    } catch {
      // Prototype not writable on this browser — real fullscreen never
      // engages anyway, so the game's exit path is a harmless no-op.
    }
    if (Document.prototype.webkitExitFullscreen) {
      Document.prototype.webkitExitFullscreen = function () {
        setFakeFullscreen(false)
      }
    }

    // Repaint kicks after focus / visibility changes (harmless; helps Chrome
    // repaint the canvas after returning from a hidden tab).
    function kickRepaint() {
      window.dispatchEvent(new Event('resize'))
    }
    function onVisible() {
      setTimeout(kickRepaint, 0)
      setTimeout(kickRepaint, 200)
    }
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) onVisible()
    })
    window.addEventListener('focus', onVisible)

    // WebGL context loss (browsers can drop the context while the tab is
    // hidden). This build has no restore path, so recover by reloading once.
    var reloaded = false
    var reloadTimer = null
    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault()
      if (reloaded) return
      reloadTimer = setTimeout(function () {
        reloaded = true
        location.reload()
      }, 2500)
    })
    canvas.addEventListener('webglcontextrestored', function () {
      if (reloadTimer) {
        clearTimeout(reloadTimer)
        reloadTimer = null
      }
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
