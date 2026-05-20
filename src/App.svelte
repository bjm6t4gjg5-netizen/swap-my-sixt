<script lang="ts">
  import Header from "./components/Header.svelte";
  import MapView from "./components/MapView.svelte";
  import BookingView from "./components/BookingView.svelte";
  import CarsView from "./components/CarsView.svelte";
  import StationsView from "./components/StationsView.svelte";
  import { activeTab } from "./lib/store";
</script>

<div class="shell">
  <Header />
  <main>
    <div class="pane" class:show={$activeTab === "navigate"}>
      <MapView active={$activeTab === "navigate"} />
    </div>
    <div class="pane scroll" class:show={$activeTab === "booking"}>
      <BookingView />
    </div>
    <div class="pane scroll" class:show={$activeTab === "cars"}>
      <CarsView />
    </div>
    <div class="pane scroll" class:show={$activeTab === "stations"}>
      <StationsView />
    </div>
  </main>
</div>

<style>
  .shell {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
  }
  main {
    position: relative;
    flex: 1;
    overflow: hidden;
  }
  .pane {
    position: absolute;
    inset: 0;
    display: none;
  }
  .pane.show { display: block; }
  .pane.scroll {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    background: var(--bg);
  }
</style>
