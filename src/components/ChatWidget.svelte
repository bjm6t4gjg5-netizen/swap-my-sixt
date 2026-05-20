<script lang="ts">
  import { tick } from "svelte";
  import {
    askLucas,
    buildSystemPrompt,
    getApiKey,
    setApiKey,
    clearApiKey,
    type ChatMessage
  } from "../lib/analyst";
  import { booking, target, targetLabel, activeTab } from "../lib/store";
  import { STATION_BY_ID } from "../lib/stations";
  import { CAR_CLASS_BY_ID } from "../lib/cars";

  const AVATAR = import.meta.env.BASE_URL + "lucas.jpg";
  const GREETING =
    "Hey — I'm Lucas, your rental analyst. Ask me anything about your Sixt swap: which station to aim for, how to read your ACRISS code, or how to play the counter.";

  let open = false;
  let keySet = getApiKey().length > 0;
  let keyInput = "";
  let messages: ChatMessage[] = [];
  let input = "";
  let busy = false;
  let error = "";
  let avatarOk = true;
  let msgEl: HTMLDivElement;

  // lift the bubble above the map's bottom sheet on the Navigate tab
  $: fabBottom = $activeTab === "navigate" ? 176 : 16;

  function bookingSummary(): string | undefined {
    const b = $booking;
    if (!b) return undefined;
    const cls = CAR_CLASS_BY_ID[b.expectedClassId]?.label ?? b.expectedClassId;
    const st = b.pickupStationId
      ? STATION_BY_ID[b.pickupStationId]?.name
      : undefined;
    const car = b.bookedExample?.trim();
    const parts = [
      car ? `${car} (booked class: ${cls})` : `booked class: ${cls}`,
      st ? `pick-up at ${st}` : "",
      b.pickupDate ? `on ${b.pickupDate}${b.pickupTime ? " " + b.pickupTime : ""}` : "",
      b.actualBrand ? `assigned car at counter: ${b.actualBrand} ${b.actualModel}` : ""
    ].filter(Boolean);
    return parts.join(", ");
  }

  async function scrollDown() {
    await tick();
    if (msgEl) msgEl.scrollTop = msgEl.scrollHeight;
  }

  function connect() {
    if (!keyInput.trim()) return;
    setApiKey(keyInput);
    keySet = true;
    keyInput = "";
    error = "";
  }
  function forgetKey() {
    clearApiKey();
    keySet = false;
    messages = [];
  }

  async function send() {
    const text = input.trim();
    if (!text || busy || !keySet) return;
    input = "";
    error = "";
    messages = [...messages, { role: "user", content: text }];
    busy = true;
    scrollDown();
    try {
      const sys = buildSystemPrompt({
        booking: bookingSummary(),
        target: targetLabel($target)
      });
      const reply = await askLucas(messages, sys);
      messages = [...messages, { role: "assistant", content: reply }];
    } catch (e) {
      error = (e as Error).message;
    } finally {
      busy = false;
      scrollDown();
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function openPanel() {
    open = true;
    scrollDown();
  }
</script>

<!-- Floating bubble -->
{#if !open}
  <button
    class="fab"
    style="bottom: calc({fabBottom}px + var(--safe-bottom))"
    on:click={openPanel}
    aria-label="Ask the analyst"
  >
    <span class="fab-label">Ask the analyst</span>
    <span class="fab-av">
      {#if avatarOk}
        <img src={AVATAR} alt="Lucas" on:error={() => (avatarOk = false)} />
      {:else}
        <span class="mono">L</span>
      {/if}
    </span>
  </button>
{/if}

<!-- Chat panel -->
{#if open}
  <div class="panel">
    <header class="p-head">
      <span class="p-av">
        {#if avatarOk}
          <img src={AVATAR} alt="Lucas" on:error={() => (avatarOk = false)} />
        {:else}
          <span class="mono">L</span>
        {/if}
      </span>
      <div class="p-id">
        <div class="p-name">Lucas</div>
        <div class="p-role">Ask the analyst</div>
      </div>
      {#if keySet}
        <button class="p-mini" on:click={forgetKey} title="Disconnect API key">Key</button>
      {/if}
      <button class="p-close" on:click={() => (open = false)} aria-label="Close">×</button>
    </header>

    {#if !keySet}
      <!-- API key setup -->
      <div class="setup">
        <div class="setup-av">
          {#if avatarOk}
            <img src={AVATAR} alt="Lucas" on:error={() => (avatarOk = false)} />
          {:else}
            <span class="mono big">L</span>
          {/if}
        </div>
        <h3>Connect to chat with Lucas</h3>
        <p>
          Lucas runs on Anthropic's Claude. Paste an API key to start — it's
          stored <b>only in this browser</b> and never uploaded or committed.
        </p>
        <input
          class="key-input"
          type="password"
          placeholder="sk-ant-api03-…"
          bind:value={keyInput}
          on:keydown={(e) => e.key === "Enter" && connect()}
        />
        <button class="connect" on:click={connect} disabled={!keyInput.trim()}>
          Connect
        </button>
        <p class="fineprint">
          Get a key at console.anthropic.com → API Keys. Calls are billed to
          your Anthropic account.
        </p>
      </div>
    {:else}
      <!-- conversation -->
      <div class="messages" bind:this={msgEl}>
        <div class="msg lucas">
          <span class="m-av">
            {#if avatarOk}
              <img src={AVATAR} alt="Lucas" on:error={() => (avatarOk = false)} />
            {:else}<span class="mono sm">L</span>{/if}
          </span>
          <div class="bubble">{GREETING}</div>
        </div>

        {#each messages as m}
          {#if m.role === "assistant"}
            <div class="msg lucas">
              <span class="m-av">
                {#if avatarOk}
                  <img src={AVATAR} alt="Lucas" on:error={() => (avatarOk = false)} />
                {:else}<span class="mono sm">L</span>{/if}
              </span>
              <div class="bubble">{m.content}</div>
            </div>
          {:else}
            <div class="msg me">
              <div class="bubble">{m.content}</div>
            </div>
          {/if}
        {/each}

        {#if busy}
          <div class="msg lucas">
            <span class="m-av">
              {#if avatarOk}
                <img src={AVATAR} alt="Lucas" on:error={() => (avatarOk = false)} />
              {:else}<span class="mono sm">L</span>{/if}
            </span>
            <div class="bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        {/if}

        {#if error}
          <div class="err">{error}</div>
        {/if}
      </div>

      <div class="composer">
        <input
          type="text"
          placeholder="Ask Lucas anything…"
          bind:value={input}
          on:keydown={onKeydown}
          disabled={busy}
        />
        <button
          class="send"
          on:click={send}
          disabled={busy || !input.trim()}
          aria-label="Send"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M4 12l16-8-7 16-2-7-7-1z" fill="currentColor" />
          </svg>
        </button>
      </div>
    {/if}
  </div>
{/if}

<style>
  /* ---------- floating bubble ---------- */
  .fab {
    position: fixed;
    right: 14px;
    z-index: 120;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 5px 5px 14px;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 100px;
    box-shadow: var(--shadow-2);
    transition: bottom 0.2s ease;
  }
  .fab:active { transform: scale(0.97); }
  .fab-label { font-size: 13.5px; font-weight: 700; color: var(--text); }
  .fab-av,
  .p-av,
  .m-av,
  .setup-av {
    border-radius: 50%;
    overflow: hidden;
    background: linear-gradient(135deg, #ff7a1a, var(--orange-dark));
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }
  .fab-av { width: 38px; height: 38px; }
  .fab-av img,
  .p-av img,
  .m-av img,
  .setup-av img { width: 100%; height: 100%; object-fit: cover; }
  .mono { color: white; font-weight: 800; font-size: 16px; }
  .mono.sm { font-size: 12px; }
  .mono.big { font-size: 30px; }

  /* ---------- panel ---------- */
  .panel {
    position: fixed;
    right: 12px;
    bottom: calc(12px + var(--safe-bottom));
    z-index: 130;
    width: min(390px, calc(100vw - 24px));
    height: min(74vh, 590px);
    background: var(--surface);
    border-radius: 20px;
    box-shadow: var(--shadow-2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .p-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 12px;
    background: linear-gradient(120deg, #ff7a1a, var(--orange));
    color: white;
    flex-shrink: 0;
  }
  .p-av { width: 38px; height: 38px; }
  .p-id { flex: 1; min-width: 0; line-height: 1.15; }
  .p-name { font-size: 15px; font-weight: 800; }
  .p-role { font-size: 11.5px; opacity: 0.9; }
  .p-mini {
    border: none;
    background: rgba(255, 255, 255, 0.22);
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 5px 9px;
    border-radius: 8px;
  }
  .p-close {
    border: none;
    background: rgba(255, 255, 255, 0.22);
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    font-size: 17px;
    line-height: 1;
  }

  /* ---------- setup ---------- */
  .setup {
    flex: 1;
    overflow-y: auto;
    padding: 22px 18px;
    text-align: center;
  }
  .setup-av {
    width: 64px;
    height: 64px;
    margin: 0 auto 12px;
  }
  .setup h3 { margin: 0 0 6px; font-size: 17px; font-weight: 800; }
  .setup p {
    margin: 0 0 12px;
    font-size: 13px;
    color: var(--text-2);
    line-height: 1.5;
  }
  .key-input {
    width: 100%;
    border: 1px solid var(--line);
    border-radius: 11px;
    padding: 11px 12px;
    font-size: 14px;
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    outline: none;
    margin-bottom: 9px;
  }
  .key-input:focus { border-color: var(--blue); }
  .connect {
    width: 100%;
    border: none;
    background: var(--blue);
    color: white;
    font-size: 15px;
    font-weight: 700;
    padding: 12px;
    border-radius: 12px;
  }
  .connect:disabled { background: var(--muted); }
  .fineprint {
    margin: 12px 0 0;
    font-size: 11px;
    color: var(--muted);
    line-height: 1.5;
  }

  /* ---------- messages ---------- */
  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 14px 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    -webkit-overflow-scrolling: touch;
    background: var(--bg);
  }
  .msg { display: flex; gap: 8px; align-items: flex-end; }
  .msg.me { justify-content: flex-end; }
  .m-av { width: 26px; height: 26px; }
  .bubble {
    max-width: 80%;
    padding: 9px 12px;
    border-radius: 15px;
    font-size: 13.5px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  .msg.lucas .bubble {
    background: var(--surface);
    color: var(--text);
    border-bottom-left-radius: 5px;
    box-shadow: var(--shadow-1);
  }
  .msg.me .bubble {
    background: var(--blue);
    color: white;
    border-bottom-right-radius: 5px;
  }

  .typing { display: flex; gap: 4px; padding: 12px; }
  .typing span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--muted);
    animation: blink 1.3s infinite ease-in-out;
  }
  .typing span:nth-child(2) { animation-delay: 0.2s; }
  .typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes blink {
    0%, 80%, 100% { opacity: 0.3; }
    40% { opacity: 1; }
  }

  .err {
    font-size: 12.5px;
    color: var(--red);
    background: rgba(255, 59, 48, 0.1);
    border-radius: 10px;
    padding: 9px 11px;
  }

  /* ---------- composer ---------- */
  .composer {
    display: flex;
    gap: 8px;
    padding: 10px;
    border-top: 1px solid var(--line-soft);
    background: var(--surface);
    flex-shrink: 0;
  }
  .composer input {
    flex: 1;
    min-width: 0;
    border: 1px solid var(--line);
    border-radius: 100px;
    padding: 10px 14px;
    font-size: 14px;
    outline: none;
  }
  .composer input:focus { border-color: var(--blue); }
  .send {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border: none;
    border-radius: 50%;
    background: var(--blue);
    color: white;
    display: grid;
    place-items: center;
  }
  .send:disabled { background: var(--muted); }
  .send:active { transform: scale(0.94); }
</style>
