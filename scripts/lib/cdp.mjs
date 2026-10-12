// Cliente mínimo del protocolo DevTools de Chrome, sin dependencias.
// Lanza Chrome sin interfaz, abre una pestaña y expone send()/on() sobre su WebSocket.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CANDIDATOS = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

export const espera = ms => new Promise(r => setTimeout(r, ms));

export async function lanzarChrome() {
  const exe = CANDIDATOS.find(p => existsSync(p));
  if (!exe) throw new Error('No encontré Chrome. Define CHROME_PATH.');
  const perfil = mkdtempSync(join(tmpdir(), 'ryori-chrome-'));
  const puerto = 9300 + Math.floor(Math.random() * 500);
  const proc = spawn(exe, [
    '--headless=new', `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--hide-scrollbars', '--mute-audio', '--lang=es-CL', 'about:blank',
  ], { stdio: 'ignore' });
  let version;
  for (let i = 0; i < 50 && !version; i++) {
    try { version = await (await fetch(`http://127.0.0.1:${puerto}/json/version`)).json(); } catch { await espera(200); }
  }
  if (!version) throw new Error('Chrome no respondió.');
  return {
    puerto,
    async pestana() {
      const t = await (await fetch(`http://127.0.0.1:${puerto}/json/new?about:blank`, { method: 'PUT' })).json();
      return conectar(t.webSocketDebuggerUrl);
    },
    async cerrar() {
      proc.kill();
      await espera(500);
      try { rmSync(perfil, { recursive: true, force: true }); } catch {}
    },
  };
}

function conectar(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let id = 0;
    const pendientes = new Map();
    const oyentes = new Map();
    ws.onmessage = ev => {
      const m = JSON.parse(ev.data);
      if (m.id && pendientes.has(m.id)) {
        const { ok, ko } = pendientes.get(m.id);
        pendientes.delete(m.id);
        m.error ? ko(new Error(m.error.message)) : ok(m.result);
      } else if (m.method) {
        (oyentes.get(m.method) || []).forEach(f => f(m.params));
      }
    };
    ws.onerror = reject;
    ws.onopen = () => resolve({
      send(method, params = {}) {
        return new Promise((ok, ko) => { pendientes.set(++id, { ok, ko }); ws.send(JSON.stringify({ id, method, params })); });
      },
      on(method, f) { if (!oyentes.has(method)) oyentes.set(method, []); oyentes.get(method).push(f); },
      off(method) { oyentes.delete(method); },
      cerrar() { ws.close(); },
    });
  });
}

// Evalúa una expresión en la página y devuelve su valor (admite promesas).
export async function evaluar(tab, expr) {
  const r = await tab.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}

export const PERFILES = {
  telefono: { width: 390, height: 844, deviceScaleFactor: 3, mobile: true },
  escritorio: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
  laptop: { width: 1536, height: 639, deviceScaleFactor: 1, mobile: false },
};

export async function emular(tab, perfil) {
  await tab.send('Emulation.setDeviceMetricsOverride', perfil);
  await tab.send('Emulation.setTouchEmulationEnabled', perfil.mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
  if (perfil.mobile) {
    await tab.send('Emulation.setUserAgentOverride', {
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
    });
  }
}

// Red móvil lenta del encargo: 1,6 Mbps de bajada, 150 ms de latencia, procesador ×4, sin caché.
export async function redLenta(tab) {
  await tab.send('Network.enable');
  await tab.send('Network.setCacheDisabled', { cacheDisabled: true });
  await tab.send('Network.emulateNetworkConditions', {
    offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 0.75e6 / 8,
  });
  await tab.send('Emulation.setCPUThrottlingRate', { rate: 4 });
}

export async function sinLimites(tab) {
  await tab.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await tab.send('Emulation.setCPUThrottlingRate', { rate: 1 });
}

// Navega y espera el evento load más un margen de calma de red.
export async function navegar(tab, url, { calma = 1500, maximo = 60000 } = {}) {
  await tab.send('Page.enable');
  let enVuelo = 0, ultimo = Date.now();
  tab.on('Network.requestWillBeSent', () => { enVuelo++; ultimo = Date.now(); });
  const fin = () => { enVuelo = Math.max(0, enVuelo - 1); ultimo = Date.now(); };
  tab.on('Network.loadingFinished', fin);
  tab.on('Network.loadingFailed', fin);
  const cargado = new Promise(r => tab.on('Page.loadEventFired', r));
  const inicio = Date.now();
  await tab.send('Page.navigate', { url });
  await Promise.race([cargado, espera(maximo)]);
  while (Date.now() - inicio < maximo && (enVuelo > 0 || Date.now() - ultimo < calma)) await espera(200);
  tab.off('Network.requestWillBeSent'); tab.off('Network.loadingFinished'); tab.off('Network.loadingFailed'); tab.off('Page.loadEventFired');
}

export async function captura(tab, { completa = false } = {}) {
  const params = completa ? { format: 'jpeg', quality: 80, captureBeyondViewport: true } : { format: 'png' };
  if (completa) {
    const { cssContentSize } = await tab.send('Page.getLayoutMetrics');
    const alto = Math.min(Math.ceil(cssContentSize.height), 12000);
    params.clip = { x: 0, y: 0, width: Math.ceil(cssContentSize.width), height: alto, scale: 1 };
  }
  const { data } = await tab.send('Page.captureScreenshot', params);
  return Buffer.from(data, 'base64');
}
