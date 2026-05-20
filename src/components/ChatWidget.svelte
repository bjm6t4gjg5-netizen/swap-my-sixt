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
  import { offlineReply } from "../lib/lucasOffline";
  import { booking, target, targetLabel, activeTab } from "../lib/store";
  import { STATION_BY_ID } from "../lib/stations";
  import { CAR_CLASS_BY_ID } from "../lib/cars";

  const AVATAR = import.meta.env.BASE_URL + "lucas.jpg";
  const GREETING =
    "Hey — I'm Lucas, your rental analyst. I work without an API key, so ask away: swap strategy, ACRISS codes, the counter game, car specs, or how to dodge a Blitzer. Add an Anthropic key in the header and I get even sharper.";

  let open = false;
  let keySet = getApiKey().length > 0;
  let showKeyPanel = false;
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
    return [
      car ? `${car} (booked class: ${cls})` : `booked class: ${cls}`,
      st ? `pick-up at ${st}` : "",
      b.pickupDate ? `on ${b.pickupDate}${b.pickupTime ? " " + b.pickupTime : ""}` : "",
      b.actualBrand ? `assigned at counter: ${b.actualBrand} ${b.actualModel}` : ""
    ]
      .filter(Boolean)
      .join(", ");
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
    showKeyPanel = false;
    error = "";
  }
  function forgetKey() {
    clearApiKey();
    keySet = false;
    showKeyPanel = false;
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    input = "";
    error = "";
    messages = [...messages, { role: "user", content: text }];
    busy = true;
    scrollDown();
    try {
      if (keySet) {
        const sys = buildSystemPrompt({
          booking: bookingSummary(),
          target: targetLabel($target)
        });
        const reply = await askLucas(messages, sys);
        messages = [...messages, { role: "assistant", content: reply }];
      } else {
        await new Promise((r) => setTimeout(r, 430));
        const reply = offlineReply(text, {
          booking: bookingSummary(),
          target: targetLabel($target)
        });
        messages = [...messages, { role: "assistant", content: reply }];
      }
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
        <div class="p-name">Lucas · the analyst</div>
        <div class="p-role">
          {keySet ? "Powered by Claude" : "Offline mode — no key needed"}
        </div>
      </div>
      <button
        class="p-mini"
        on:click={() => (keySet ? forgetKey() : (showKeyPanel = !showKeyPanel))}
        title={keySet ? "Disconnect API key" : "Connect an API key"}
      >
        {keySet ? "Key ✓" : "+ Key"}
      </button>
      <button class="p-close" on:click={() => (open = false)} aria-label="Close">×</button>
    </header>

    {#if showKeyPanel && !keySet}
      <div class="keycard">
        <p>
          Optional: paste an Anthropic API key for the full Claude-powered
          Lucas. It's stored <b>only in this browser</b>, never uploaded.
        </p>
        <input
          type="password"
          placeholder="sk-ant-api03-…"
          bind:value={keyInput}
          on:keydown={(e) => e.key === "Enter" && connect()}
        />
        <div class="keycard-row">
          <button class="kc-skip" on:click={() => (showKeyPanel = false)}>
            Stay offline
          </button>
          <button class="kc-go" on:click={connect} disabled={!keyInput.trim()}>
            Connect
          </button>
        </div>
      </div>
    {/if}

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
          <div class="msg me"><div class="bubble">{m.content}</div></div>
        {/if}
      {/each}

      {#if busy}
        <div class="msg lucas">
          <span class="m-av">
            {#if avatarOk}
              <img src={AVATAR} alt="Lucas" on:error={() => (avatarOk = false)} />
            {:else}<span class="mono sm">L</span>{/if}
          </span>
          <div class="bubble typing"><span></span><span></span><span></span></div>
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
  </div>
{/if}

<style>
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
  .m-av {
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
  .m-av img { width: 100%; height: 100%; object-fit: cover; }
  .mono { color: white; font-weight: 800; font-size: 16px; }
  .mono.sm { font-size: 12px; }

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
  .p-name { font-size: 14.5px; font-weight: 800; }
  .p-role { font-size: 11px; opacity: 0.9; }
  .p-mini {
    border: none;
    background: rgba(255, 255, 255, 0.22);
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 6px 9px;
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

  .keycard {
    background: var(--blue-soft);
    padding: 12px;
    flex-shrink: 0;
  }
  .keycard p {
    margin: 0 0 8px;
    font-size: 12px;
    color: var(--text-2);
    line-height: 1.5;
  }
  .keycard input {
    width: 100%;
    border: 1px solid var(--line);
    border-radius: 9px;
    padding: 9px 11px;
    font-size: 13px;
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    outline: none;
    margin-bottom: 8px;
  }
  .keycard input:focus { border-color: var(--blue); }
  .keycard-row { display: flex; gap: 8px; }
  .kc-skip,
  .kc-go {
    flex: 1;
    border: none;
    border-radius: 9px;
    padding: 9px;
    font-size: 13px;
    font-weight: 700;
  }
  .kc-skip { background: var(--surface-2); color: var(--text); }
  .kc-go { background: var(--blue); color: white; }
  .kc-go:disabled { background: var(--muted); }

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
