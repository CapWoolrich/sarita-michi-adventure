# CAT HUNTER — Roadmap "Social Adventure" (Fortnite-like v1)

> Branch: `feature/cat-hunter-fortnite-like-v1`
> Objetivo: evolucionar CAT HUNTER hacia una experiencia 3D social tipo aventura
> (mundos vivos, personajes, tienda, multiplayer presencial) con identidad kawaii propia,
> sin copiar assets/UI/estética de otros juegos y sin sacrificar rendimiento móvil.

---

## 1. Qué se implementó en esta fase

### FASE A — Mundos premium + interacciones ligeras

Nueva capa `src/game3d/premium/` montada desde `Game3DCanvas` (después de `WorldScene`,
antes de `MissionChallengeLayer`):

| Archivo | Rol |
|---|---|
| `PremiumWorldProps.jsx` | Props decorativos + interactivos por mundo (1 componente por tema, límites estrictos) |
| `InteractiveProp.jsx` | Interacción genérica por proximidad (radio XZ, edge-trigger, cooldown, `once`) |
| `CityHouseLite.jsx` | Casita con puerta visual interactiva; `interiorId` reservado para interiores futuros |
| `PortalLite.jsx` | Portal decorativo premium (distinto del portal de escape de misión) |
| `VehicleLite.jsx` | Auto kawaii interactivo ("vehículo encontrado", sin conducción aún) |

Contenido por mundo (todo geometría simple, sin pointLights nuevos, sin física):

- **Bosque Místico**: luciérnagas animadas, 3 cristales mágicos, cofre.
- **Ciudad Sakura**: plaza central (pavimento, farol, 3 bancas, señales kawaii), 4 casitas
  con puertas interactivas mirando al centro, cofre.
- **Lago Cristal / Playa Algodón / Puerto Pastel**: muelle de tablones, flores acuáticas,
  partículas suaves, cofre (capa compartida `LakeBeachProps` con posiciones por mundo).
- **Arboleda Niebla**: niebla de suelo animada (discos transparentes), calabazas
  spooky-kawaii con ojos brillantes, luciérnagas verdes, cofre (+monedas).
- **Jardín Lunar**: niebla baja lavanda, luciérnagas lavanda, cofre.
- **Montaña Aurora**: 4 cristales grandes, camino elevado visual de 4 escalones de roca
  (sin física, solo verticalidad visual), cofre.
- **Valle Nubes**: partículas doradas, cofre.
- **Villa Estelar**: `PortalLite` central épico interactivo, 2 vehículos, cofre.
- **Ciudad Neón**: `PortalLite` neón, 3 vehículos interactivos, luciérnagas cian, cofre.

Interacciones (mensajes vía `onPropInteract` → feedback HUD existente + haptics):

- Cofres: una vez por nivel, otorgan 12–20 monedas reales (van a `settings.coins`).
- Puertas: "Casita kawaii: pronto podrás entrar".
- Autos: "¡Vehículo encontrado! Conducción próximamente".
- Portales decorativos: "Portal estelar: eventos especiales próximamente".

### FASE B — Personajes + Tienda + Multiplayer conectado

**B1. Personajes** (`src/game/characters/characters.js` + `CharacterSelectPanel.jsx`):

- 5 personajes: Sarita (base), Exploradora Kawaii (free), Guardiana Niebla (9 niveles),
  Runner Neón (15), Princesa Estelar (21).
- Variaciones baratas del mismo modelo: colores dress/hat + aura de color en el suelo
  (`auraColor` en `CharacterSarita3D`). Sin GLB nuevos.
- Persistencia: `settings.selectedCharacterId`.
- Regla de convivencia con outfits (`resolvePlayerLook`): un outfit elegido a mano en el
  Vestidor manda; con Vestidor en "auto", el personaje define los colores. El aura siempre
  viene del personaje.

**B2. Tienda** (`src/game/shop/shopCatalog.js` + `ShopPanel.jsx`):

- Usa las monedas existentes (`settings.coins`). Sin pagos reales ni economía online.
- Comprar un outfit es un atajo: el desbloqueo gratis por progreso (1 cada 3 niveles)
  sigue intacto. Persistencia: `settings.purchasedOutfitIds`.
- `isOutfitUnlocked()` ahora acepta `purchasedOutfitIds` (5º parámetro opcional,
  retrocompatible). El Vestidor muestra "Comprado en la Tienda".
- Precios: Sakura 150 → Neón 800 (ver `SHOP_ITEMS`).
- Botones nuevos en Splash: 🛍️ Tienda y 🦸 Personajes.

**B3. Multiplayer más conectado** (`peerSession.js`, `RemotePlayer.jsx`, `CatHunt3D.jsx`):

- **Bugfix real**: el host enviaba su `hello` antes de que existiera conexión, así que el
  invitado nunca veía nombre/color del host. Ahora `PeerSession` guarda `localHello` y se
  lo presenta a cada conexión nueva al abrirse.
- `hello` ampliado: `outfitColor`, `hatColor`, `characterId` (campo `color` se conserva
  por compatibilidad).
- Si cambias outfit/personaje en vivo, se re-emite `hello` y el otro jugador lo ve.
- `pos` ahora manda rotación real (`ry` desde `playerPositionRef`) y `anim` basado en
  movimiento real (umbral de desplazamiento), no en el modo velocidad.
- `RemotePlayer`: nombre flotante (sprite de canvas, sin drei `Html` ni fuentes externas),
  gorra con color sincronizado, bob de carrera cuando `anim === 'run'`.
- Cadencia de red intacta (100 ms); single-player no depende de nada de esto.

---

## 2. Qué queda pendiente (fases futuras)

1. **Interiores de casas**: `CityHouseLite` ya pasa `interiorId`. Plan: al interactuar,
   transición a una "interior zone" pequeña (mismo canvas, teleport + skybox interior
   simple), nunca cargar interiores de todas las casas a la vez.
2. **Vehículos reales**: `VehicleLite.onInteract` es el punto de enganche. Plan: estado
   `mountedVehicleId` en `useGameRuntime`, multiplicador de velocidad + cámara más alta;
   nada de física de ruedas.
3. **Eventos multiplayer**: usar `PortalLite` como punto de reunión; mensaje nuevo
   `{ type: 'event', eventId }` en PeerSession (el protocolo ya tolera tipos extra).
4. **Misiones cooperativas**: sincronizar `capture` (el mensaje ya existe y no se consume);
   empezar por "contador compartido de michis" solo cuando ambos están en el mismo nivel
   (`sendWorldChange` ya existe).
5. **Tienda más premium**: rotación diaria, cofres comprables, auras/trails como ítems.
   Mantener todo local hasta que exista backend.
6. **Personajes con modelos 3D reales**: una fase aparte, con lazy-loading por personaje,
   presupuesto de tamaño por GLB y fallback al ChibiDoll actual.

---

## 3. Riesgos técnicos y cómo se mitigaron

| Riesgo | Mitigación aplicada |
|---|---|
| Más meshes por mundo → FPS móvil | Límites duros por mundo (~6–14 props + 1 grupo de partículas); `detail` se apaga si `vegetationMultiplier < 0.7` (perfil low) |
| setState por frame en interacciones | `InteractiveProp` usa solo refs; hint/anillo se togglean con `.visible` |
| Luces nuevas | 0 pointLights nuevos; todo brillo es `meshBasicMaterial` con `toneMapped=false` |
| Romper outfits existentes | Parámetro opcional nuevo al final de `isOutfitUnlocked`; defaults conservan comportamiento |
| Multiplayer como dependencia | Todo lo social está detrás de `mpSession`; sin sesión no se monta nada |
| Spam de red | `hello` solo se re-emite cuando cambia el look (efecto con deps memoizadas); `pos` sigue a 100 ms |
| Farmeo de cofres | `once` por montaje de nivel y montos pequeños (12–20 monedas) |
| Progreso del usuario | No se cambió ninguna key de localStorage; solo campos nuevos con defaults y sanitización en `loadSettings` |

Señales a vigilar en QA manual (iPhone):
- FPS en Ciudad Sakura (mundo con más props nuevos) y Ciudad Neón.
- Que el anillo/hint de props no parpadee al borde del radio.
- Que el nameplate remoto no acumule texturas (se hace `dispose()` al cambiar nombre).

---

## 4. Cómo seguir sin romper rendimiento

1. Cada prop nuevo pasa por `PremiumWorldProps` con posiciones `useMemo` + seed determinística.
2. Máximo un grupo de partículas animadas por mundo (un solo `useFrame` por grupo).
3. Nada de sombras en props pequeños; `castShadow` solo en volúmenes grandes.
4. Si una idea necesita luz dinámica, usar material emisivo/basic primero.
5. Gating por `graphicsProfile` antes de subir conteos.
6. `npm run build` + preview de Vercel + prueba manual de los mundos tocados antes de mergear.

---

## 5. Archivos tocados en esta fase

**Nuevos**
- `src/game3d/premium/PremiumWorldProps.jsx`
- `src/game3d/premium/InteractiveProp.jsx`
- `src/game3d/premium/CityHouseLite.jsx`
- `src/game3d/premium/PortalLite.jsx`
- `src/game3d/premium/VehicleLite.jsx`
- `src/game/characters/characters.js`
- `src/game/shop/shopCatalog.js`
- `src/game/components/ShopPanel.jsx`
- `src/game/components/CharacterSelectPanel.jsx`
- `docs/CAT_HUNTER_ROADMAP_FORTNITE_LIKE.md`

**Modificados**
- `src/CatHunt3D.jsx` — paneles nuevos, look de jugador (personaje+outfit), interacción de props, hello multiplayer
- `src/game3d/Game3DCanvas.jsx` — monta PremiumWorldProps, aura, props remotos extendidos, `ry` en playerPositionRef
- `src/game3d/CharacterSarita3D.jsx` — aura opcional
- `src/game3d/RemotePlayer.jsx` — nameplate, gorra sincronizada, bob de carrera
- `src/game/multiplayer/peerSession.js` — re-hello a conexiones nuevas (bugfix), hello ampliado
- `src/game/outfits/outfits.js` — outfits comprados
- `src/game/components/Wardrobe.jsx` — estado "comprado"
- `src/game/components/SplashScreen.jsx` — botones Tienda y Personajes
- `src/game/persistence/userSettings.js` — `selectedCharacterId`, `purchasedOutfitIds`
- `src/styles/game-ui.css` — estilos de cards vestidor/tienda/personajes
