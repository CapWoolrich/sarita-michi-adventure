# CAT HUNTER — Working Context & Safety Rules

> Documento operativo para trabajar la app sin romper el gameplay, el rendimiento ni la estructura actual.
>
> Última base validada: `main` después del PR #54 (`feat: rewards and outfit progression loop`).
> Stack actual: React 18 + Vite + Three/R3F + Drei + postprocessing + Tone + PeerJS.

---

## 1. Objetivo del proyecto

CAT HUNTER es una PWA/juego 3D estilo aventura kawaii premium para Sarita, enfocada en:

- rescatar michis,
- explorar mundos visualmente distintos,
- superar misiones cortas,
- desbloquear recompensas,
- mantener rendimiento estable en iPhone/mobile,
- crecer por fases sin meter sistemas pesados que congelen la app.

La prioridad no es agregar muchas cosas de golpe. La prioridad es que cada cambio haga el juego más divertido sin sacrificar estabilidad.

---

## 2. Estado funcional actual

### App base

- Proyecto Vite.
- Scripts principales:
  - `npm run dev`
  - `npm run build`
  - `npm run preview`
- Deploy en Vercel conectado a GitHub.
- `main` debe mantenerse estable.

### Gameplay actual

El juego usa 11 mundos, cada mundo con 3 niveles:

- `world-1` a `world-10` principales.
- `world-11` secreto: Ciudad Neón.
- Cada nivel se define desde `src/game/worldsConfig.js`.
- La progresión real se maneja en `src/game/useGameRuntime.js`.
- La escena 3D se renderiza desde `src/game3d/Game3DCanvas.jsx`.

### Misiones actuales

Tipos de misión existentes:

- `rescue`: rescate normal.
- `golden`: Michi Dorado.
- `time_attack`: carrera contra reloj.
- `exploration`: campanitas antes de capturar.
- `careful`: enemigos / conservar corazones.
- `fog`: radar limitado y ambiente oscuro.
- `slow_zone`: zonas lentas.
- `city_hide`: ciudad con props/casitas.
- `mountain_jump`: plataformas simples.
- `escape`: portal o sobrevivir 45 segundos.
- `finale`: nivel final con Michi Dorado.

### Loop de recompensas actual

- Monedas al completar niveles.
- Cofres por avance.
- `RewardToast` al terminar nivel.
- 10 outfits de Sarita.
- Se desbloquea un outfit cada 3 niveles completados.
- El vestidor permite seleccionar outfit manual o auto por mundo.

---

## 3. Archivos críticos y responsabilidades

### `src/CatHunt3D.jsx`

Responsabilidad:

- Orquestador principal de UI + runtime + canvas.
- Controla splash, juego, paneles, vestidor, recompensas, transición, pausa, tutorial, multiplayer.
- Conecta `useGameRuntime` con `Game3DCanvas`.

Regla:

- No convertirlo otra vez en un archivo gigante de lógica duplicada.
- No mover lógica 3D pesada aquí.
- No cambiar HUD o controles desde aquí si el usuario pidió no tocar HUD.

---

### `src/game/useGameRuntime.js`

Responsabilidad:

- Fuente principal de verdad para gameplay.
- Maneja mundo actual, nivel actual, gatos, capturas, score, timer, misión, corazones, power-ups, progresión y completado de nivel.

Regla:

- Cualquier nuevo modo de juego debe tener su estado aquí, no disperso en varios componentes.
- No duplicar conteo de gatos o completado de nivel fuera del runtime.
- `completeLevel`, `goToNextLevel`, `restartLevel`, `captureCat`, `takeDamage`, `completeEscape` deben conservarse como flujo central.

---

### `src/game/worldsConfig.js`

Responsabilidad:

- Define mundos, niveles, misiones, objetivos y modifiers.

Regla:

- Mantener 3 niveles por mundo salvo que el usuario pida explícitamente otra estructura.
- Para nuevos retos, primero agregar `missionType` + `modifiers`; luego implementar solo lo mínimo en runtime/canvas.
- No agregar 10+ props/enemigos por misión desde aquí.

---

### `src/game3d/Game3DCanvas.jsx`

Responsabilidad:

- Render 3D principal.
- Crea la escena R3F.
- Renderiza mundo, personaje, gatos, ZombieCats, power-ups, campanas, enemigos, multiplayer y FX.

Regla:

- No meter lógica de gameplay aquí salvo medición espacial o interacción inmediata del canvas.
- Evitar `setState` dentro de `useFrame` salvo casos muy controlados.
- Usar `refs` para datos por frame: player position, cat live positions, movement multiplier.

---

### `src/game3d/MissionChallengeLayer.jsx`

Responsabilidad:

- Capa ligera para retos visuales/interactivos por misión:
  - zonas lentas,
  - portal de escape,
  - props de ciudad,
  - plataformas de montaña.

Regla:

- Mantener esta capa ligera.
- No volver a meter sistemas pesados de persecución aquí si `ZombieCat` ya maneja el escape.
- Máximo recomendado por misión:
  - 4 zonas lentas,
  - 5 casitas/props,
  - 4 plataformas,
  - 1 portal.

---

### `src/game3d/WorldScene.jsx`

Responsabilidad:

- Ambiente visual del mundo: cielo, niebla, luces, terreno, bioma.

Regla:

- Las variaciones visuales por misión deben vivir aquí cuando sean atmósfera, luz o niebla.
- Mantener cambios visuales baratos: fog, color, intensidad, no miles de meshes nuevos.

---

### `src/game3d/PowerUps.jsx`

Responsabilidad:

- Render y pickup de potenciadores.

Regla:

- No ejecutar actualizaciones pesadas directamente dentro del frame 3D.
- Mantener pickup con detección ligera.
- No agregar luces individuales pesadas por cada power-up.

---

### `src/game/outfits/outfits.js`

Responsabilidad:

- Catálogo de outfits.
- Reglas de desbloqueo.
- Resolución de outfit activo.

Regla:

- Agregar outfits como variantes ligeras de color/tint antes de intentar nuevos modelos 3D.
- Evitar meter GLB nuevos de outfits sin una fase separada de rendimiento.

---

### `src/game/progression/progressionStorage.js`

Responsabilidad:

- Progreso persistente en `localStorage`.
- Niveles completados.
- Mundos desbloqueados.

Regla:

- No cambiar keys existentes sin migración.
- No borrar progreso del usuario.
- Si se cambia estructura de niveles, validar que `loadProgress()` no deje al usuario en un nivel inválido.

---

## 4. Reglas de oro para no romper la app

### Regla 1 — Antes de editar, leer contexto

Antes de tocar código, revisar al menos:

- `docs/CAT_HUNTER_WORKING_CONTEXT.md`
- `src/game/worldsConfig.js`
- `src/game/useGameRuntime.js`
- `src/CatHunt3D.jsx`
- archivos específicos de la feature.

---

### Regla 2 — Una feature por PR

No mezclar en un mismo PR:

- nuevos modos de juego,
- rediseño visual,
- cambios de HUD,
- cambios de progresión,
- optimización,
- multiplayer,
- nuevos modelos 3D.

Cada PR debe tener una intención clara y pequeña.

---

### Regla 3 — No tocar HUD salvo orden explícita

El HUD actual ha sido protegido por petición del usuario.

No cambiar:

- `MinimalHUD`,
- layout de botones de acción,
- controles táctiles,
- posición de botones,
- barra/overlay de juego,

salvo que el usuario lo pida directamente.

---

### Regla 4 — Mobile performance first

Cada cambio debe pensar primero en iPhone/mobile.

Evitar:

- muchos `pointLight` dinámicos,
- muchos meshes por nivel,
- sombras en demasiados props,
- loops pesados en `useFrame`,
- `setState` por frame,
- física compleja,
- importar modelos grandes sin lazy loading,
- postprocessing nuevo sin toggle gráfico.

Preferir:

- geometría simple,
- posiciones determinísticas,
- `useMemo`,
- `refs`,
- fog/lights en vez de más objetos,
- cambios en config primero.

---

### Regla 5 — No duplicar lógica de misión

Cada misión debe tener:

1. Configuración en `worldsConfig.js`.
2. Estado/resultado en `useGameRuntime.js`.
3. Visual/interacción ligera en `MissionChallengeLayer.jsx` o `WorldScene.jsx`.
4. Render específico en `Game3DCanvas.jsx` solo si es necesario.

No crear contadores paralelos en componentes UI.

---

### Regla 6 — Escape es especial

`escape` no se juega como captura normal.

Condición de victoria:

- llegar al portal, o
- sobrevivir el tiempo configurado.

En escape:

- el botón capturar no debe ser el objetivo principal,
- los gatos se renderizan como amenaza/ZombieCat,
- no se debe completar por capturar todos los gatos,
- el portal vive en `MissionChallengeLayer`,
- `completeEscape()` vive en runtime.

---

### Regla 7 — No volver a meter la versión pesada que congelaba

Queda prohibido reintroducir sin fase separada:

- muchos gatos perseguidores adicionales en `MissionChallengeLayer`,
- props masivos por ciudad,
- rampas/plataformas con física compleja,
- niebla + luces + enemigos + props pesados en un mismo PR,
- lógica grande duplicada en canvas.

El camino correcto es iterar con sistemas ligeros.

---

## 5. Flujo seguro de trabajo

### Para cualquier cambio de código

1. Crear branch nueva desde `main`.
2. Revisar archivos relevantes antes de editar.
3. Hacer cambio pequeño.
4. Ejecutar `npm run build`.
5. Revisar deploy preview de Vercel.
6. Probar manualmente los niveles afectados.
7. Solo mergear si Vercel está en success y no hay regresión visible.

### Para cambios de gameplay

Checklist mínimo:

- ¿El nivel inicia?
- ¿El timer corre?
- ¿La condición de victoria funciona?
- ¿Game Over funciona?
- ¿Restart funciona?
- ¿Next Level funciona?
- ¿Home funciona?
- ¿No se traba al pasar de nivel?
- ¿No se toca HUD sin autorización?

### Para cambios visuales 3D

Checklist mínimo:

- Probar en calidad low/medium si aplica.
- Evitar más de 1-2 luces nuevas por feature.
- Evitar duplicar sombras en props pequeños.
- Evitar modelos externos grandes.
- Validar que no aumente la carga al recoger power-ups.

---

## 6. Pruebas manuales recomendadas

Después de cada PR importante, probar:

1. Splash → Comenzar aventura.
2. Mundo 1 Nivel 1: rescate normal.
3. Mundo 1 Nivel 2: escape.
4. Mundo 3 Nivel 1: zonas lentas.
5. Mundo 4 Nivel 1: niebla.
6. Mundo 6 Nivel 1: plataformas.
7. Completar 3 niveles → desbloqueo de outfit.
8. Abrir Vestidor → cambiar outfit.
9. Volver al juego → validar outfit aplicado.
10. Agarrar power-ups → validar que no se trabe.
11. Perder corazones → validar Game Over.
12. Reiniciar nivel.
13. Completar nivel → transición → siguiente nivel.

---

## 7. Roadmap recomendado

### Próximo PR recomendado: diversión sin riesgo

- Hacer más visible el combo.
- Agregar sonido/feedback ligero de combo.
- Mejorar RewardToast visualmente sin más lógica pesada.
- Agregar una vista sencilla de progreso de outfits.

### PR posterior: misiones más entretenidas

- Michi fantasma: aparece/desaparece con intervalos simples.
- Campanitas contra reloj.
- Michi Dorado nervioso: se aleja un poco del jugador.
- Rescate perfecto: 3 estrellas si no pierde corazones.

### PR posterior: tienda ligera

- Usar monedas para abrir cofres.
- Cofres desbloquean variantes visuales.
- Evitar economía compleja al inicio.

### PR posterior: polish premium

- Música distinta por misión.
- Sonidos de captura/campanita/power-up.
- Portal más bonito con geometría simple.
- Niebla con mejor dirección de luz.

---

## 8. Comandos útiles

```bash
npm install
npm run dev
npm run build
npm run preview
```

### Debug runtime

La app soporta query param:

```text
?debugInput=1
```

Útil para ver datos de input/posición/captura cuando se depuran controles.

### Desactivar FX

```text
?nofx=1
```

Útil para comparar rendimiento con/sin postprocessing.

---

## 9. Señales de peligro

Si aparece cualquiera de estos síntomas, detener cambios grandes y revisar rendimiento:

- Se traba al recoger power-up.
- Se queda pegado en transición de nivel.
- El botón Atrapar no responde.
- Los gatos no cuentan.
- Escape completa por captura en vez de portal/supervivencia.
- La app requiere salir y entrar para cargar.
- El HUD bloquea controles.
- El build de Vercel pasa pero el juego se congela en mobile.

---

## 10. Política de merges

Mergear a `main` solo cuando:

- Vercel preview esté en `success`.
- El cambio sea pequeño o tenga plan de rollback.
- El usuario haya validado visualmente si el cambio afecta gameplay/UX.
- No haya cambios no solicitados en HUD o controles.

Para documentación, se permite merge directo si no toca código.

---

## 11. Prompt operativo para futuras sesiones

Usar este comando antes de pedir nuevas features:

```text
Lee docs/CAT_HUNTER_WORKING_CONTEXT.md y trabaja Cat Hunter en modo seguro: revisa contexto antes de tocar código, haz cambios pequeños por PR, no cambies el HUD salvo que lo pida, cuida rendimiento móvil, valida Vercel y respeta la arquitectura actual.
```

---

## 12. Principio rector

CAT HUNTER debe evolucionar como juego premium, pero siempre con esta jerarquía:

1. Que no se rompa.
2. Que corra fluido en iPhone.
3. Que Sarita pueda entender y disfrutar el objetivo.
4. Que cada nivel se sienta diferente.
5. Que cada PR deje la app mejor y más mantenible.

Si una idea se ve espectacular pero amenaza el rendimiento, dividirla en fases pequeñas.
