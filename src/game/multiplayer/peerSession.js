/**
 * Multiplayer foundation usando PeerJS (P2P, no requiere backend custom).
 * Modo simple 1v1 o 1+N con mesh básico.
 *
 * Flujo:
 *  - Host crea sesión → genera roomCode (ej. "ABC4")
 *  - Join introduce el roomCode → conecta P2P
 *  - Ambos comparten posición, capturas y nombre
 *
 * Mensaje protocol:
 *  { type: 'pos', x, z, ry, anim }
 *  { type: 'capture', catId, by }
 *  { type: 'hello', name, outfitId, color, outfitColor, hatColor, characterId, auraColor }
 *  { type: 'action', action, id }  // chest_open | house_enter | house_exit | portal_use | vehicle_on | vehicle_off
 *  { type: 'world', worldId, levelId }   // host comparte nivel actual
 */
// PeerJS se carga dinámicamente para no bloquear la app si falla el CDN
let PeerCtor = null;
async function loadPeerJS() {
  if (PeerCtor) return PeerCtor;
  const mod = await import('peerjs');
  PeerCtor = mod.Peer || mod.default?.Peer || mod.default;
  return PeerCtor;
}

const PREFIX = 'sarita-';

function makeRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export class PeerSession {
  constructor({ onPlayerJoin, onPlayerLeave, onMessage, onStatus }) {
    this.peer = null;
    this.connections = new Map(); // peerId -> dataConnection
    this.players = new Map();     // peerId -> { name, x, z, ry, color, outfitId, anim }
    this.localPeerId = null;
    this.roomCode = null;
    this.isHost = false;
    this.localHello = null;   // último hello local, para presentarse ante nuevos peers
    this.onPlayerJoin = onPlayerJoin;
    this.onPlayerLeave = onPlayerLeave;
    this.onMessage = onMessage;
    this.onStatus = onStatus;
  }

  _setStatus(s) { this.onStatus?.(s); }

  async createRoom() {
    const code = makeRoomCode();
    this.roomCode = code;
    this.isHost = true;
    this._setStatus('connecting');
    const PeerClass = await loadPeerJS();
    return new Promise((resolve, reject) => {
      this.peer = new PeerClass(PREFIX + code);
      this.peer.on('open', (id) => {
        this.localPeerId = id;
        this._setStatus('hosting');
        this.peer.on('connection', (conn) => this._handleConnection(conn));
        resolve({ roomCode: code });
      });
      this.peer.on('error', (err) => {
        this._setStatus('error');
        reject(err);
      });
    });
  }

  async joinRoom(roomCode) {
    this.roomCode = roomCode;
    this.isHost = false;
    this._setStatus('connecting');
    const PeerClass = await loadPeerJS();
    return new Promise((resolve, reject) => {
      this.peer = new PeerClass();
      this.peer.on('open', (id) => {
        this.localPeerId = id;
        const conn = this.peer.connect(PREFIX + roomCode, { reliable: false, serialization: 'json' });
        conn.on('open', () => {
          this._handleConnection(conn);
          this._setStatus('connected');
          resolve({ ok: true });
        });
        conn.on('error', (e) => { this._setStatus('error'); reject(e); });
      });
      this.peer.on('error', (e) => { this._setStatus('error'); reject(e); });
    });
  }

  _handleConnection(conn) {
    const peerId = conn.peer;
    this.connections.set(peerId, conn);
    if (!this.players.has(peerId)) this.players.set(peerId, {});

    conn.on('open', () => {
      // Presentarse ante el peer nuevo (el host puede haber enviado su hello
      // antes de que existiera esta conexión)
      if (this.localHello) {
        try { conn.send(this.localHello); } catch {}
      }
      this.onPlayerJoin?.(peerId);
    });
    conn.on('data', (msg) => {
      if (!msg || typeof msg !== 'object') return;
      const p = this.players.get(peerId) ?? {};
      if (msg.type === 'pos') {
        p.x = msg.x; p.z = msg.z; p.ry = msg.ry; p.anim = msg.anim;
        this.players.set(peerId, p);
      } else if (msg.type === 'hello') {
        p.name = msg.name; p.color = msg.color; p.outfitId = msg.outfitId;
        p.outfitColor = msg.outfitColor; p.hatColor = msg.hatColor; p.characterId = msg.characterId;
        p.auraColor = msg.auraColor;
        this.players.set(peerId, p);
      } else if (msg.type === 'action') {
        if (msg.action === 'house_enter') p.zone = 'interior';
        else if (msg.action === 'house_exit') p.zone = 'outside';
        else if (msg.action === 'vehicle_on') p.vehicle = true;
        else if (msg.action === 'vehicle_off') p.vehicle = false;
        this.players.set(peerId, p);
      }
      this.onMessage?.(peerId, msg);
    });
    conn.on('close', () => {
      this.connections.delete(peerId);
      this.players.delete(peerId);
      this.onPlayerLeave?.(peerId);
    });
    conn.on('error', () => {
      this.connections.delete(peerId);
      this.players.delete(peerId);
      this.onPlayerLeave?.(peerId);
    });
  }

  broadcast(msg) {
    for (const conn of this.connections.values()) {
      try { if (conn.open) conn.send(msg); } catch {}
    }
  }

  sendPosition(x, z, ry, anim = 'idle') {
    this.broadcast({ type: 'pos', x, z, ry, anim });
  }

  sendHello({ name, color, outfitId, outfitColor, hatColor, characterId, auraColor }) {
    this.localHello = { type: 'hello', name, color, outfitId, outfitColor, hatColor, characterId, auraColor };
    this.broadcast(this.localHello);
  }

  /** Interacciones de mundo: cofres, casas, portales, vehículos. */
  sendAction(action, id = null) {
    this.broadcast({ type: 'action', action, id });
  }

  sendCapture(catId) {
    this.broadcast({ type: 'capture', catId, by: this.localPeerId });
  }

  sendWorldChange(worldId, levelId) {
    this.broadcast({ type: 'world', worldId, levelId });
  }

  getRemotePlayers() {
    return Array.from(this.players.entries()).map(([id, p]) => ({ id, ...p }));
  }

  destroy() {
    for (const conn of this.connections.values()) {
      try { conn.close(); } catch {}
    }
    this.connections.clear();
    this.players.clear();
    if (this.peer) {
      try { this.peer.destroy(); } catch {}
    }
    this.peer = null;
    this.roomCode = null;
    this._setStatus('idle');
  }
}
