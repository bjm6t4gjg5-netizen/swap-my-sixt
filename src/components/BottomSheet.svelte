<script lang="ts">
  export let state: "collapsed" | "mid" | "full" = "mid";

  function cycle() {
    state = state === "collapsed" ? "mid" : state === "mid" ? "full" : "collapsed";
  }

  function onHandleDown(e: PointerEvent) {
    const startY = e.clientY;
    const startState = state;
    let moved = 0;
    const onMove = (ev: PointerEvent) => {
      moved = ev.clientY - startY;
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (Math.abs(moved) < 14) {
        cycle();
        return;
      }
      if (moved < -45) {
        state = startState === "collapsed" ? "mid" : "full";
      } else if (moved > 45) {
        state = startState === "full" ? "mid" : "collapsed";
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }
</script>

<div class="sheet {state}">
  <div
    class="handle"
    on:pointerdown={onHandleDown}
    role="button"
    tabindex="0"
    aria-label="Resize panel"
    on:keydown={(e) => e.key === "Enter" && cycle()}
  >
    <div class="grabber"></div>
  </div>
  <div class="header"><slot name="header" /></div>
  <div class="body"><slot /></div>
</div>

<style>
  .sheet {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    z-index: 30;
    background: var(--material-2);
    backdrop-filter: var(--blur);
    -webkit-backdrop-filter: var(--blur);
    border-radius: 20px 20px 0 0;
    box-shadow: var(--shadow-3);
    padding-bottom: var(--safe-bottom);
    display: flex;
    flex-direction: column;
    max-height: 88%;
    transition: transform 0.34s cubic-bezier(0.32, 0.72, 0, 1);
    will-change: transform;
  }
  .sheet.collapsed { transform: translateY(calc(100% - 96px - var(--safe-bottom))); }
  .sheet.mid       { transform: translateY(calc(100% - 332px - var(--safe-bottom))); }
  .sheet.full      { transform: translateY(0); }

  .handle {
    flex-shrink: 0;
    padding: 8px 0 4px;
    cursor: grab;
    touch-action: none;
    user-select: none;
  }
  .grabber {
    width: 36px; height: 5px;
    background: var(--line);
    border-radius: 3px;
    margin: 0 auto;
  }

  .header { flex-shrink: 0; }
  .body {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    min-height: 0;
  }

  @media (min-width: 760px) {
    .sheet {
      left: 14px;
      right: auto;
      bottom: 14px;
      width: 388px;
      border-radius: 20px;
      transition: max-height 0.28s ease;
    }
    .sheet.collapsed { transform: none; max-height: 96px; }
    .sheet.mid       { transform: none; max-height: 380px; }
    .sheet.full      { transform: none; max-height: calc(100% - 130px); }
  }
</style>
