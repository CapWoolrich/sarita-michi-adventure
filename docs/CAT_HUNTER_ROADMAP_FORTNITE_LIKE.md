# CAT HUNTER — Roadmap "Social Adventure" (Fortnite-like)

> Branch: `feature/cat-hunter-fortnite-like-v1`
> Objetivo: evolucionar CAT HUNTER hacia una experiencia 3D social tipo aventura
> (mundos vivos, personajes, tienda, multiplayer presencial) con identidad kawaii propia,
> sin copiar assets/UI/estética de otros juegos y sin sacrificar rendimiento móvil.
>
> Estado: **v2 — segunda pasada (gameplay real)**. La v1 fue base visual; la v2
> convierte los placeholders en sistemas jugables.

---

## 1. Qué es JUGABLE hoy (ya no es placeholder)

### Casas con interior real (Ciudad Sakura)
- 2 casitas funcionales: acercarse a la puerta teletransporta a un interior
  "dollhouse" (paredes bajas para que la cámara en tercera persona nunca se
  ocluya — decisión deliberada, no hay colisión de cámara en el juego).
- Cada interior tiene: camita, mesita, lámpara, un **cofre con tesoro** y un
  **michi de casita** que da monedas al acariciarlo.
- Puerta de salida que regresa afuera de la casa.
- Los interiores viven en esquinas lejanas del mapa (±88, dentro del clamp de
  movimiento ±110) en la misma escena: cero carga extra, y en multiplayer
  ambos jugadores ven los mismos interiores (si los dos entran, se ven dentro).
- Las otras 2 casitas muestran "cerrada" (decorativas).

### Cofres reales
- Tapa que se abre con animación al interactuar (estado visual, no solo toast).
- Dan monedas reales a `settings.coins` (12–20 según mundo).
- Estado por nivel: al reiniciar/cambiar nivel se rearman (`levelNonce` del
  runtime remonta la capa premium y limpia `openedChestsRef`).
- En multiplayer se emite `action: chest_open`; el otro jugador ve la tapa
  abierta (mismo id determinístico por mundo) y recibe feedback.

### Vehículos funcionales (lite)
- Interactuar con un auto activa "modo vehículo": velocidad ×1.6 + kart kawaii
  visual que sigue a Sarita + feedback. Dura 14 s (30 s en la misión de
  carrera); se baja sola al expirar o al volver a interactuar con un auto.
- Sin física: el boost se aplica en el único escritor de
  `movementMultiplierRef` (`MovementRuntime` en MissionChallengeLayer), que
  combina zonas lentas × vehículo.
- Disponibles en Villa Estelar (2) y Ciudad Neón (3).

### Portales funcionales
- Pares de portales conectados (A↔B) en Villa Estelar y Ciudad Neón: entrar a
  uno teletransporta junto al otro (atajo real de mapa), con animación de giro
  y feedback. El destino cae fuera del radio del portal receptor para evitar
  ping-pong.

### 2 misiones nuevas jugables
- **`city_quest`** (Mundo 2, nivel 1 — "Misión de ciudad"): entra a 2 casitas,
  abre sus 2 cofres-tesoro y vuelve a la plaza; al juntar todo aparece una zona
  de regreso brillante en la plaza que completa el nivel. Progreso con feedback
  ("Casita 1/2", "Tesoro 2/2 — vuelve a la plaza"). Los michis son bonus de
  puntos, no condición de victoria.
- **`vehicle_dash`** (Mundo 10, nivel 1 — "Carrera kawaii"): súbete a un
  vehículo y cruza 3 anillos giratorios antes de que acabe el tiempo (80 s).
  Los anillos solo cuentan con vehículo activo (aviso si pasas a pie); los
  cruzados se ponen verdes. Completar los 3 termina el nivel.
- Estado central en `useGameRuntime` (`missionState.quest`,
  `missionState.checkpointsHit`, `recordQuestEvent`, `hitCheckpoint`,
  `completeQuest`), configuración en `worldsConfig`, visual en
  `MissionChallengeLayer` — siguiendo la regla 5 del working context.

### Personajes visualmente diferentes
- Accesorios geométricos (sin GLB) visibles en juego, local Y remoto:
  - Exploradora: mochila + sombrero explorador.
  - Guardiana Niebla: capa + capucha + orbe flotante.
  - Runner Neón: visor + aletas neón emisivas.
  - Princesa Estelar: coronita dorada + estrellita flotante.
  - Sarita: look base limpio.
- Componente compartido `CharacterAccessories` (local con ChibiDoll, remoto
  escala 0.8).

### Multiplayer más real
- `hello` sincroniza: nombre, personaje, outfit, gorra y **aura**; se re-emite
  al cambiar cualquier cosa del look.
- `pos` lleva rotación real y anim idle/run por movimiento real.
- Nuevo mensaje `action`: cofre abierto, entrar/salir de casa, portal,
  vehículo on/off → el otro jugador recibe feedback ("🏠 Tu amigo entró a una
  casita") y estado visual: kart en el jugador remoto, nameplate con 🏠 cuando
  está en interior, cofres abiertos.
- Todo sigue siendo P2P (PeerJS) y 100 % opcional; sin sesión no se monta nada.

### Tienda con 3 categorías
- Pestañas: 👗 Outfits / 🦸 Personajes / ✨ Accesorios.
- Personajes comprables con monedas (400/600/800) como atajo al desbloqueo por
  niveles; al comprar se equipa.
- Accesorios nuevos: 3 auras (Sakura 120, Dorada 250, Neón 350) — visibles en
  el suelo del jugador y sincronizadas en multiplayer; equipar/quitar desde la
  tienda.
- Estados claros: equipado / comprado / ganado por progreso / precio /
  faltan monedas. Sin pagos reales; todo persiste en localStorage.

---

## 2. Qué sigue siendo placeholder o lite (honesto)

- **Interiores**: solo en Ciudad Sakura (2). Neon City no tiene casas
  enterables aún. El interior es dollhouse, no habitación cerrada con techo.
- **Vehículos**: no hay conducción real (volante/derrape/física); es boost +
  kart visual montado. El jugador remoto ve el kart pero no la trayectoria
  exacta del giro del kart (usa la rotación del personaje).
- **Cofres en multiplayer**: el otro jugador ve el cofre abierto y recibe
  evento, pero cada jugador puede cobrar su propia recompensa (decisión
  amigable para juego de niños, evita griefing).
- **Co-op light mission**: NO implementada (era opcional); el protocolo
  `action` deja lista la base para "ambos activan una campana".
- **Misión city_quest** solo funciona en mundos con interiores (por eso está
  en Mundo 2); vehicle_dash requiere mundos con vehículos (Mundo 10).
- **Accesorios**: son auras (anillo de color), no geometría sobre el cuerpo.
- **Captura remota de gatos**: sigue sin sincronizarse (fuera de alcance
  acordado).

---

## 3. Riesgos técnicos

| Riesgo | Estado/Mitigación |
|---|---|
| Teleport rompe cámara | La cámara hace lerp (0.12) → pequeño barrido al teletransportar; aceptable y da sensación de viaje. Si molesta: snap de cámara en el mismo frame. |
| Interiores cerca del borde del mapa | Dentro del clamp ±110; props de biomas lejanos pueden verse alrededor (las paredes ocultan la mayoría). |
| Doble escritor de movementMultiplierRef | Eliminado: `MovementRuntime` es el único escritor (slow zones × vehículo). |
| Spam de checkpoints por frame | Dedupe local (`firedRef`) + dedupe en runtime por id; se limpia al reiniciar (hitIds vacío). |
| Restart no rearmaba cofres/quest | `levelNonce` en runtime remonta PremiumWorldProps/MissionChallengeLayer y limpia cofres en cada startLevel. |
| FPS móvil | Sin luces nuevas, sin física; interiores ~25 meshes ×2 solo en sakura-city; checkpoints 3 toros. Validar en iPhone Mundo 2 y Mundo 10. |
| Quest atascada si el jugador no encuentra casas | El texto objetivo + feedback de progreso guían; las casas funcionales están a radio 22–34 del spawn. Si frustra: añadir marcador en MiniMap (fase futura). |

---

## 4. Fases futuras

1. **Interiores v2**: techo + iluminación cálida propia cuando haya cámara con
   colisión; interiores en Ciudad Neón; más variedad de muebles.
2. **Vehículos v2**: giro tipo kart (input directo al kart), drift suave,
   carreras multiplayer con posiciones.
3. **Co-op light**: campana doble usando `action` + confirmación del host.
4. **Marcadores de misión en MiniMap** (casas/anillos/plaza).
5. **Tienda v3**: rotación diaria, cofres comprables, trails como accesorios.
6. **Modelos 3D reales por personaje** con lazy-loading y fallback al ChibiDoll.
7. **Sync de capturas** para misiones cooperativas reales.

---

## 5. Archivos clave de esta capa

**Nuevos (v2)**
- `src/game3d/premium/HouseInteriorLite.jsx` — interior dollhouse funcional
- `src/game3d/premium/CharacterAccessories.jsx` — accesorios por personaje
- `src/game3d/premium/MountedVehicle.jsx` — kart montado (+ `KartMesh` compartido)

**Nuevos (v1)**
- `src/game3d/premium/PremiumWorldProps.jsx` (v2: interiores, portales A↔B, vehículos reales, cofres con tapa)
- `src/game3d/premium/InteractiveProp.jsx`
- `src/game3d/premium/CityHouseLite.jsx`
- `src/game3d/premium/PortalLite.jsx`
- `src/game3d/premium/VehicleLite.jsx` (v2: montar/desmontar real)
- `src/game/characters/characters.js` (v2: precios + compra)
- `src/game/shop/shopCatalog.js` (v2: personajes + accesorios)
- `src/game/components/ShopPanel.jsx` (v2: pestañas)
- `src/game/components/CharacterSelectPanel.jsx`

**Modificados (v2)**
- `src/game/useGameRuntime.js` — quest/checkpoints/levelNonce/completeQuest
- `src/game/worldsConfig.js` — misiones city_quest (M2N1) y vehicle_dash (M10N1)
- `src/game/missions/missionTypes.js` — copy de misiones nuevas
- `src/game3d/MissionChallengeLayer.jsx` — MovementRuntime, DashCheckpoints, QuestReturnZone
- `src/game3d/Game3DCanvas.jsx` — teleport, vehicleState, kart, props quest
- `src/game3d/RemotePlayer.jsx` — accesorios, kart, aura, badge interior
- `src/game3d/CharacterSarita3D.jsx` — accesorios locales
- `src/game/multiplayer/peerSession.js` — sendAction + zona/vehículo del peer
- `src/CatHunt3D.jsx` — orquestación de interacciones, quest, tienda, mp
- `src/game/persistence/userSettings.js`, `src/styles/game-ui.css`
