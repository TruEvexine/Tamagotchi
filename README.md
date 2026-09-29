#Creado por Rogelio Emmanuel Ceja Acosta
# 🐣 Tamagotchi Web

Una pequeña mascota virtual web creada con estética **8-bit / pixel art**, donde el jugador debe cuidar a una criatura durante un día completo de tiempo simulado.

El objetivo es mantener sus necesidades equilibradas, responder a sus peticiones y superar **24 horas simuladas** sin que la mascota se convierta en fantasma.

## 🎮 Características
- Creación y nombre de la mascota.
- Reloj de tiempo simulado.
- 6 segundos reales = 1 hora simulada.
- Ciclo completo de 24 horas.
- Hambre, diversión, higiene y felicidad.
- Peticiones de comida.
- Sobrealimentación.
- Eventos aleatorios.
- Acciones interactivas.
- Animaciones pixel art.
- Efectos visuales.
- Sonidos y música.
- Estadísticas de cuidado.
- Resumen final.

## ⏱️ Sistema de tiempo
```text
6 segundos reales = 1 hora simulada
24 horas × 6 segundos = 144 segundos
```
Una partida completa dura aproximadamente **2 minutos y 24 segundos en tiempo real**.

La velocidad del reloj forma parte de las reglas del juego y no puede modificarse desde la interfaz.

## 🐣 Cómo jugar
1. Introduce el nombre de la mascota.
2. Observa hambre, diversión, higiene y felicidad.
3. Usa las acciones disponibles para cuidarla.
4. Responde a eventos como jugar, cantar, bailar o ir al baño.
5. Intenta completar las 24 horas.

## 👻 Cómo convertirse en fantasma
### Ignorar comida
```text
2 peticiones de comida ignoradas → fantasma
```

### Sobrealimentación
```text
3 sobrealimentaciones consecutivas → fantasma
```

Cuando ocurre, la partida termina anticipadamente.

## 📊 Estadísticas
Se registran como mínimo:
- comidas
- comidas excesivas
- juegos
- limpiezas
- eventos activados/completados/ignorados
- peticiones de comida e ignoradas
- valores finales
- estado final
- tiempo sobrevivido

## 🎨 Diseño
Dirección artística:
```text
8-bit
Pixel Art
Retro
Tierno
Minimalista
```

La mascota es original y diseñada específicamente para este proyecto.

## 🔊 Audio
Incluye música de fondo y sonidos de interacción, eventos, advertencias, transformación y finalización. El audio debe poder controlarse desde la interfaz.

## 🛠️ Tecnologías
```text
Frontend: React + TypeScript
Build: Vite
Estilos: CSS
Assets: SVG original y pixel art
```

## 🚀 Instalación
```bash
npm install
npm run dev
```

Para generar una compilación de producción:

```bash
npm run build
```

## 📁 Estructura prevista
```text
src/
├── app/
│   └── App.tsx
├── audio/
│   └── useAudio.ts
├── components/
│   ├── EventCard.tsx
│   ├── FinalSummary.tsx
│   ├── NeedMeter.tsx
│   ├── NameEntry.tsx
│   └── PetSprite.tsx
├── game/
│   ├── config.ts
│   ├── createInitialGameState.ts
│   ├── events.ts
│   ├── gameReducer.ts
│   ├── persistence.ts
│   └── types.ts
├── assets/
│   └── sprites/
├── styles/
├── main.tsx
└── vite-env.d.ts
```

La música y los efectos se sintetizan con Web Audio después de una interacción; no se
reproducen automáticamente ni requieren archivos de audio externos.

La partida actual y las preferencias de audio se guardan en `localStorage`. Al volver
al juego, una partida que estaba en curso se restaura en pausa para que el tiempo no
avance mientras la página está cerrada. «Nueva partida» elimina la partida anterior.

## 🧠 Arquitectura
Separación principal:
```text
Game State
Game Clock
Pet Logic
Event System
Statistics
UI
Audio
Animation
```

## 📚 Documentación
- `plan.md` — funcionalidades, reglas y criterios de aceptación.
- `DESIGN.md` — dirección visual, UX, animaciones y audio.
- `AGENTS.md` — reglas para agentes y desarrolladores.
- `README.md` — documentación general del proyecto.

**El proyecto mantiene un único README principal.**

## 🧪 Estado del MVP
- [x] Creación de mascota.
- [x] Sistema de tiempo con pausa.
- [x] Necesidades y acciones de cuidado.
- [x] Alimentación, peticiones y sobrealimentación.
- [x] Estado fantasma.
- [x] Eventos aleatorios con expiración.
- [x] Animaciones y feedback.
- [x] Audio opcional.
- [x] Estadísticas y resumen final.
- [x] Responsive layout.
- [ ] Pulido final.

## 📜 Reglas principales
```text
6 segundos reales = 1 hora simulada
24 horas simuladas = final de partida
2 comidas ignoradas = fantasma
3 sobrealimentaciones consecutivas = fantasma
```

## 🎯 Objetivo
```text
CREAR
  ↓
CUIDAR
  ↓
INTERACTUAR
  ↓
RESPONDER
  ↓
SOBREVIVIR
  ↓
COMPLETAR 24 HORAS
  ↓
VER RESULTADOS
```

La prioridad es que la mascota se sienta **viva, expresiva y propia**, con sistemas sencillos acompañados de buen feedback visual y audiovisual.
