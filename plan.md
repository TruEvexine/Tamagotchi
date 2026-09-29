# 🐣 Tamagotchi Web — Plan de Desarrollo

## 1. Objetivo del proyecto

Desarrollar una **mascota virtual web estilo Tamagotchi**, completamente funcional dentro del navegador, en la que el usuario deba cuidar a una criatura digital durante un mínimo de **24 horas simuladas**.

La experiencia deberá ser sencilla, clara y entretenida, con una estética propia basada en **pixel art / 8 bits**, animaciones ligeras, efectos visuales, sonidos y música.

El objetivo principal del MVP es que el usuario pueda:

* Crear y nombrar a su mascota.
* Ver el paso del tiempo simulado.
* Alimentarla.
* Jugar con ella.
* Atender sus necesidades.
* Responder a eventos aleatorios.
* Observar cómo cambian sus estadísticas.
* Mantenerla con vida durante 24 horas simuladas.
* Recibir un resumen final de su cuidado.

---

# 2. Alcance del MVP

La primera versión deberá contener obligatoriamente:

### Identidad

* Pantalla inicial.
* Solicitud del nombre de la mascota.
* Validación básica del nombre.
* Presentación inicial de la criatura.
* Nombre visible durante toda la partida.

### Tiempo

* Reloj de simulación visible.
* **6 segundos reales = 1 hora simulada.**
* El tiempo deberá ser fijo y no configurable desde la interfaz.
* Una partida completa tendrá una duración de:

**24 horas simuladas × 6 segundos = 144 segundos reales = 2 minutos y 24 segundos.**

* El reloj deberá comenzar después de crear/iniciar la mascota.
* El tiempo deberá avanzar automáticamente.

### Necesidades

Mostrar cuatro indicadores principales:

1. 🍗 Hambre
2. 🎮 Diversión
3. 🧼 Higiene
4. ❤️ Felicidad

Los valores deberán ser fáciles de interpretar visualmente.

Ejemplo:

```text
🍗 Hambre       ███████░░░ 70%
🎮 Diversión    █████░░░░░░ 50%
🧼 Higiene      ████████░░ 80%
❤️ Felicidad    ██████░░░░ 60%
```

Los indicadores deberán actualizarse durante el transcurso de la partida.

---

# 3. Sistema de tiempo

## Regla principal

```text
1 hora simulada = 6 segundos reales
```

Por lo tanto:

| Tiempo real | Tiempo simulado |
| ----------: | --------------: |
|         6 s |             1 h |
|        12 s |             2 h |
|        30 s |             5 h |
|        60 s |            10 h |
|       120 s |            20 h |
|       144 s |            24 h |

El sistema deberá trabajar internamente con horas simuladas para facilitar futuras expansiones.

Ejemplo conceptual:

```js
simulatedHour = Math.floor(elapsedSeconds / 6);
```

No se deberá implementar un sistema basado únicamente en `setInterval` acumulativo para calcular el tiempo, ya que una futura pausa o pérdida de frames podría provocar inconsistencias.

La referencia principal deberá ser el tiempo transcurrido desde el inicio de la partida.

---

# 4. Estado de la mascota

La mascota tendrá un estado interno similar a:

```js
pet = {
    name: "",
    hunger: 100,
    fun: 100,
    hygiene: 100,
    happiness: 100,

    simulatedHour: 0,

    foodRequests: 0,
    ignoredFoodRequests: 0,
    overeatingCount: 0,

    eventsCompleted: 0,
    eventsIgnored: 0,

    totalFood: 0,
    totalPlay: 0,
    totalCleaning: 0,

    isGhost: false,
    isAlive: true
}
```

Los valores deberán estar limitados:

```text
mínimo = 0
máximo = 100
```

---

# 5. Hambre

El hambre deberá disminuir progresivamente con el paso del tiempo.

El objetivo no es que la mascota muera rápidamente, sino crear una necesidad constante que obligue al jugador a prestar atención.

Ejemplo de comportamiento:

```text
Cada hora:
Hambre - X
```

La cantidad exacta deberá poder ajustarse durante el desarrollo mediante constantes configurables.

Ejemplo:

```js
const HUNGER_DECAY_PER_HOUR = 8;
```

---

# 6. Alimentación

La interfaz deberá incluir un botón:

```text
🍎 DAR COMIDA
```

Al utilizarlo:

* Aumenta el hambre/saciedad.
* Aumenta ligeramente la felicidad.
* Registra la acción.
* Actualiza las estadísticas.

Ejemplo:

```text
Hambre +25
Felicidad +3
```

Los valores deberán ser configurables.

---

# 7. Petición de comida

Cada **6 horas simuladas**, la mascota deberá solicitar comida.

Ejemplo:

```text
6:00  → pide comida
12:00 → pide comida
18:00 → pide comida
24:00 → finaliza partida
```

La petición deberá producir:

* Alerta visual.
* Cambio de animación de la mascota.
* Mensaje.
* Sonido opcional.

Ejemplo:

```text
🍗 ¡Tengo hambre!

¿Me das algo de comer?
```

La petición deberá permanecer registrada hasta que:

* El jugador le dé comida.

o

* Transcurra suficiente tiempo para considerarla ignorada.

---

# 8. Regla de dos comidas ignoradas

La mascota deberá convertirse en fantasma si se ignoran **2 ocasiones de petición de comida**.

```text
Petición 1 ignorada
        ↓
Petición 2 ignorada
        ↓
👻 MASCOTA FANTASMA
```

Cuando ocurra:

* Detener las necesidades normales.
* Detener los eventos.
* Cambiar visualmente el personaje.
* Mostrar un mensaje de estado.
* Reproducir un efecto/sonido especial.
* Impedir continuar el cuidado normal.

Mensaje sugerido:

```text
👻 Tu mascota se ha convertido en fantasma...

No atendiste sus necesidades a tiempo.
```

La partida deberá conservar las estadísticas acumuladas para poder mostrarlas posteriormente.

---

# 9. Exceso de comida

También deberá existir una condición de sobrealimentación.

Si el usuario da demasiada comida **3 veces consecutivas**, la mascota se convierte en fantasma.

La definición exacta de "mucha comida" deberá estar controlada por una constante.

Ejemplo:

```js
const OVERFEED_THRESHOLD = 3;
```

Cada alimentación excesiva:

```text
1ª → advertencia
2ª → advertencia grave
3ª → fantasma
```

Ejemplo de mensajes:

```text
😐 Creo que fue demasiada comida...

🤢 Ya comí demasiado...

👻 Me sobrealimentaste demasiado...
```

La aplicación deberá diferenciar entre:

```text
alimentación normal
alimentación excesiva
```

para que una comida normal no active accidentalmente el contador.

---

# 10. Diversión

La diversión deberá disminuir lentamente con el tiempo.

El usuario podrá recuperarla mediante:

```text
🎮 JUGAR
```

El botón podrá utilizarse como interacción directa y también como respuesta a eventos aleatorios.

Ejemplo:

```text
Diversión +25
Felicidad +5
```

---

# 11. Higiene

La higiene deberá disminuir con el paso del tiempo y especialmente después de determinados eventos.

La interfaz deberá incluir una acción:

```text
🧼 LIMPIAR
```

Esta acción deberá:

* Recuperar higiene.
* Aumentar ligeramente felicidad.
* Reproducir una animación.
* Generar un sonido corto.

Ejemplo:

```text
Higiene +30
Felicidad +2
```

---

# 12. Felicidad

La felicidad deberá funcionar como una estadística derivada parcialmente del cuidado.

Podrá aumentar mediante:

* Alimentación adecuada.
* Juego.
* Higiene.
* Resolver eventos.
* Cantar.
* Bailar.

Podrá disminuir mediante:

* Hambre elevada.
* Mala higiene.
* Aburrimiento.
* Ignorar eventos.
* Ignorar peticiones de comida.

No deberá depender exclusivamente de una fórmula automática.

Deberá existir una combinación entre acciones directas y estado general.

---

# 13. Estados generales

La mascota deberá mostrar mensajes o tarjetas dependiendo de su estado actual.

Ejemplos:

### Feliz

```text
❤️ ¡Estoy muy feliz!

Me estás cuidando muy bien.
```

### Hambrienta

```text
🍗 Tengo hambre...

¿Podrías darme algo de comer?
```

### Aburrida

```text
😐 Estoy un poco aburrida...

¿Jugamos?
```

### Sucia

```text
🧼 Creo que necesito un baño...
```

### Muy feliz

```text
✨ ¡Qué bien me siento!

¡Eres un gran cuidador!
```

### Estado crítico

```text
⚠️ Algo no va bien...

Necesito atención.
```

El sistema deberá seleccionar automáticamente el mensaje adecuado según las estadísticas y eventos activos.

---

# 14. Eventos aleatorios

Durante las 24 horas simuladas deberán ocurrir **al menos 5 eventos aleatorios diferentes**.

Los eventos deberán ser breves y requerir una acción del usuario.

Ejemplos:

## Evento 1 — Baño

```text
🧼 ¡Necesito ir al baño!

[AYUDAR]
```

Acción:

* Aumentar higiene.
* Aumentar felicidad.

---

## Evento 2 — Jugar

```text
🎮 ¡Quiero jugar contigo!

[JUGAR]
```

Acción:

* Aumentar diversión.
* Aumentar felicidad.

---

## Evento 3 — Cantar

```text
🎤 ¡Quiero cantar!

[¡CANTAR!]
```

Acción:

* Aumentar felicidad.
* Reproducir sonido musical.

---

## Evento 4 — Bailar

```text
💃 ¡Bailemos!

[BAILAR]
```

Acción:

* Aumentar diversión.
* Aumentar felicidad.
* Animación especial.

---

## Evento 5 — Dormir

```text
😴 Tengo sueño...

[DORMIR]
```

Acción:

* Recuperar felicidad.
* Reducir temporalmente ciertas necesidades.
* Animación de sueño.

---

## Evento 6 — Atención

```text
❤️ ¡Hazme caso!

[ACARICIAR]
```

Acción:

* Aumentar felicidad.

---

# 15. Sistema de eventos

Los eventos deberán manejarse mediante un sistema centralizado.

Ejemplo conceptual:

```js
events = [
    {
        id: "bathroom",
        message: "¡Necesito ir al baño!",
        action: "BAÑO",
        effects: {
            hygiene: +25,
            happiness: +5
        }
    },

    {
        id: "play",
        message: "¡Quiero jugar!",
        action: "JUGAR",
        effects: {
            fun: +25,
            happiness: +10
        }
    }
]
```

Esto permitirá agregar nuevos eventos posteriormente sin modificar la lógica principal del juego.

---

# 16. Aparición de eventos

Los eventos deberán aparecer de forma aleatoria.

No deberán aparecer constantemente.

Deberá existir:

```text
cooldown mínimo
probabilidad de aparición
evento activo
```

Un evento activo deberá permanecer visible hasta que:

* El usuario lo resuelva.

o

* Se agote su tiempo límite.

Si se ignora:

* Registrar el evento como ignorado.
* Aplicar una pequeña penalización cuando corresponda.

---

# 17. Personaje 8 bits

La mascota deberá ser completamente original.

No utilizar personajes existentes, sprites protegidos o diseños reconocibles de franquicias externas.

El personaje deberá utilizar:

* Pixel art.
* Resolución pequeña.
* Paleta limitada.
* Silueta reconocible.
* Animaciones sencillas.

Ejemplo conceptual:

```text
    ▄██████▄
   █  ●  ● █
   █   ▄   █
   █  ▀▀▀  █
    ▀██████▀
```

El diseño definitivo deberá pertenecer exclusivamente a este proyecto.

---

# 18. Animaciones

Las animaciones deberán ser sencillas pero cuidadas.

Animaciones mínimas:

### Idle

Movimiento ligero de respiración.

### Feliz

Pequeño salto.

### Comer

Movimiento repetitivo hacia la comida.

### Jugar

Movimiento rápido.

### Baño

Animación relacionada con limpieza.

### Cantar

Movimiento de boca/cuerpo.

### Bailar

Animación lateral.

### Dormir

Ojos cerrados + pequeño movimiento.

### Fantasma

Cambio de sprite + flotación vertical.

No se requiere un sistema complejo de animación.

Se priorizará:

```text
pocos frames
+
buena sincronización
+
feedback visual
```

---

# 19. Efectos visuales

La interfaz deberá incluir microinteracciones.

Ejemplos:

* Partículas al alimentar.
* Corazones al aumentar felicidad.
* Estrellas al completar un evento.
* Pequeño rebote de botones.
* Flash suave al cambiar una estadística.
* Transiciones entre estados.
* Efecto especial al convertirse en fantasma.

Las animaciones deberán evitar sobrecargar la interfaz.

---

# 20. Sonidos

El proyecto deberá incluir sonidos cortos para acciones importantes.

Mínimos:

* Click.
* Alimentación.
* Juego.
* Baño.
* Evento.
* Éxito.
* Advertencia.
* Transformación en fantasma.
* Final de partida.

Los sonidos deberán ser cortos y coherentes con la estética 8 bits.

---

# 21. Música

Deberá existir música de fondo opcional.

Características:

* Loop.
* Estética retro/8 bits.
* Volumen moderado.
* Control para activar/desactivar música.

Interfaz:

```text
🔊 Música: ON/OFF
```

y opcionalmente:

```text
🔈 Sonidos: ON/OFF
```

---

# 22. Interfaz principal

La interfaz deberá estar organizada de manera clara.

Estructura conceptual:

```text
┌─────────────────────────────────────┐
│          TAMAGOTCHI WEB             │
│                                     │
│       🕐 14:00 / 24:00              │
│                                     │
│           [ MASCOTA ]               │
│                                     │
│       ❤️ ¡Estoy feliz!              │
│                                     │
│  🍗 ████████░░                      │
│  🎮 ██████░░░░                      │
│  🧼 █████████░                      │
│  ❤️ ███████░░░                      │
│                                     │
│ [🍎 COMIDA] [🎮 JUGAR]              │
│ [🧼 LIMPIAR] [❤️ ATENCIÓN]          │
│                                     │
│       EVENTO ACTIVO                 │
│       [ ACCIÓN ]                    │
│                                     │
└─────────────────────────────────────┘
```

La distribución definitiva podrá adaptarse al diseño visual.

---

# 23. Nombre de la mascota

Antes de comenzar:

```text
¡Vamos a crear tu mascota!

¿Cómo quieres llamarla?

[________________]

[ COMENZAR ]
```

Validaciones:

* No permitir nombre vacío.
* Establecer una longitud máxima.
* Eliminar espacios innecesarios.
* Evitar caracteres problemáticos.

Una vez iniciado:

```text
🐣 ¡Hola, NOMBRE!
```

---

# 24. Estado de partida

La aplicación deberá tener estados claramente diferenciados:

```text
START
↓
PLAYING
↓
EVENT
↓
PLAYING
↓
GHOST
```

o:

```text
PLAYING
↓
24 HORAS
↓
COMPLETED
```

Estados principales:

```js
START
PLAYING
EVENT_ACTIVE
GHOST
COMPLETED
PAUSED
```

No deberá permitirse ejecutar acciones incompatibles con el estado actual.

---

# 25. Final de las 24 horas

Cuando el reloj llegue a:

```text
24:00
```

deberá detenerse la simulación.

La mascota no deberá continuar perdiendo estadísticas.

Deberá aparecer un **modal/popup centrado** con el resumen de la partida.

---

# 26. Resumen final

El resumen deberá incluir datos recolectados durante la partida.

Ejemplo:

```text
╔════════════════════════════╗
║     🐣 RESUMEN DEL DÍA     ║
╠════════════════════════════╣
║                            ║
║ Mascota: Pixel             ║
║                            ║
║ ❤️ Felicidad final: 87%    ║
║ 🍗 Hambre final: 76%       ║
║ 🎮 Diversión: 91%          ║
║ 🧼 Higiene: 82%            ║
║                            ║
║ 🍎 Comidas: 4              ║
║ 🎮 Juegos: 5               ║
║ 🧼 Limpiezas: 3            ║
║ 🎲 Eventos resueltos: 6    ║
║ ⚠️ Eventos ignorados: 1    ║
║                            ║
║ Tiempo cuidado: 24 horas   ║
║                            ║
║ ¡Gracias por cuidarme! ❤️  ║
╚════════════════════════════╝
```

Si la mascota se convirtió en fantasma antes de las 24 horas, el resumen deberá indicar:

```text
👻 ESTADO: FANTASMA
```

y mostrar las estadísticas acumuladas hasta ese momento.

---

# 27. Datos que deberán registrarse

Durante la partida deberán recolectarse como mínimo:

```js
statistics = {
    totalFood,
    normalFood,
    excessiveFood,

    totalPlay,
    totalCleaning,

    eventsTriggered,
    eventsCompleted,
    eventsIgnored,

    foodRequests,
    ignoredFoodRequests,

    highestHappiness,
    lowestHappiness,

    highestHunger,
    lowestHunger,

    simulatedHoursSurvived,

    finalState
}
```

Estos datos servirán tanto para el resumen como para futuras expansiones.

---

# 28. Diseño visual

La interfaz deberá tener una identidad visual propia.

## Dirección artística

```text
Pixel Art
8-bit
Retro
Tierno
Minimalista
Colorido
```

La mascota deberá ser el elemento visual principal.

La interfaz deberá evitar parecer una plantilla administrativa.

Deberá sentirse como un pequeño videojuego.

---

# 29. Responsive Design

La página deberá funcionar correctamente en:

* Desktop.
* Laptop.
* Tablet.
* Teléfono.

En móviles:

* Los botones deberán ser grandes.
* Las estadísticas deberán seguir siendo legibles.
* El personaje deberá permanecer centrado.
* El modal final deberá adaptarse al tamaño de pantalla.

---

# 30. Arquitectura recomendada

El proyecto deberá mantener una separación clara entre:

```text
UI
GAME STATE
TIME SYSTEM
PET SYSTEM
EVENT SYSTEM
AUDIO
ANIMATIONS
STATISTICS
```

Una estructura conceptual:

```text
/src
│
├── components/
│
├── game/
│   ├── gameState.js
│   ├── gameClock.js
│   ├── pet.js
│   ├── events.js
│   └── statistics.js
│
├── audio/
│
├── assets/
│   ├── sprites/
│   ├── sounds/
│   └── music/
│
├── styles/
│
└── main.js
```

La estructura podrá adaptarse al framework utilizado.

---

# 31. Sistema de constantes

Los valores principales deberán estar centralizados.

Ejemplo:

```js
const GAME_CONFIG = {
    REAL_SECONDS_PER_GAME_HOUR: 6,

    TOTAL_GAME_HOURS: 24,

    HUNGER_DECAY: 8,
    FUN_DECAY: 5,
    HYGIENE_DECAY: 4,

    FOOD_RESTORE: 25,
    PLAY_RESTORE: 25,
    CLEAN_RESTORE: 30,

    MAX_IGNORED_FOOD_REQUESTS: 2,
    MAX_CONSECUTIVE_OVERFEEDING: 3,

    EVENT_COOLDOWN: 8
};
```

Esto permitirá balancear el juego rápidamente sin modificar múltiples archivos.

---

# 32. Accesibilidad y UX

La interfaz deberá proporcionar feedback visual y textual.

No depender exclusivamente del color.

Por ejemplo:

```text
⚠️ Hambre baja
❤️ Felicidad alta
🧼 Necesita limpieza
```

Los botones deberán tener estados:

```text
normal
hover
active
disabled
```

Los elementos interactivos deberán ser fácilmente identificables.

---

# 33. Persistencia

Para el MVP no es obligatorio crear una cuenta de usuario ni utilizar backend.

La partida podrá funcionar completamente en el navegador.

Opcionalmente se podrá utilizar:

```text
localStorage
```

para conservar:

* Nombre.
* Configuración de audio.
* Última partida.
* Estadísticas.

Si se implementa persistencia, deberá evitarse que una partida anterior interfiera accidentalmente con una nueva.

---

# 34. Readme general

El proyecto deberá incluir un:

```text
README.md
```

que explique de forma clara:

## ¿Qué es?

Descripción breve del Tamagotchi.

## Características

Lista de funcionalidades.

## Cómo ejecutar

Ejemplo:

```bash
npm install
npm run dev
```

o los comandos correspondientes al stack utilizado.

## Cómo jugar

Explicar:

* Crear mascota.
* Alimentarla.
* Jugar.
* Limpiarla.
* Resolver eventos.
* Sobrevivir 24 horas.

## Sistema de tiempo

Explicar claramente:

```text
6 segundos reales = 1 hora simulada
```

## Sistema de estados

Explicar las condiciones de fantasma.

## Estructura del proyecto

Explicar las carpetas principales.

## Audio

Explicar cómo se gestionan música y sonidos.

## Personaje

Indicar que la mascota y sus assets son originales del proyecto.

---

# 35. Documentación del código

El código deberá utilizar nombres descriptivos.

Evitar:

```js
x
a
tmp
foo
```

Preferir:

```js
simulatedHour
hunger
ignoredFoodRequests
consecutiveOverfeeding
activeEvent
```

Las funciones principales deberán tener una responsabilidad clara.

Ejemplo:

```js
updateGameClock()
updatePetNeeds()
checkFoodRequest()
triggerRandomEvent()
resolveEvent()
feedPet()
playWithPet()
cleanPet()
calculatePetState()
finishGame()
showFinalSummary()
```

---

# 36. Reglas de desarrollo

Durante el desarrollo deberán respetarse estas reglas:

### Regla 1

No implementar funcionalidades fuera del alcance del MVP sin que sean necesarias.

### Regla 2

La lógica del tiempo deberá estar centralizada.

### Regla 3

Las estadísticas deberán ser independientes de la interfaz.

### Regla 4

Los eventos deberán ser configurables.

### Regla 5

Los valores de balance deberán estar centralizados.

### Regla 6

El personaje deberá ser original y estar diseñado específicamente para este proyecto.

### Regla 7

La interfaz deberá priorizar claridad sobre cantidad de elementos.

### Regla 8

Las animaciones deberán mejorar el feedback y no convertirse en decoración excesiva.

---

# 37. Fases de implementación

## Fase 1 — Base

* Crear proyecto.
* Configurar estructura.
* Crear página inicial.
* Crear sistema de nombre.
* Crear personaje provisional.
* Crear interfaz principal.

### Resultado

El usuario puede iniciar una partida y visualizar la mascota.

---

## Fase 2 — Tiempo

* Implementar reloj.
* Implementar conversión 6s → 1h.
* Mostrar tiempo.
* Detener automáticamente a las 24 horas.

### Resultado

El ciclo completo dura exactamente 144 segundos.

---

## Fase 3 — Necesidades

Implementar:

* Hambre.
* Diversión.
* Higiene.
* Felicidad.

Agregar:

* Degradación.
* Recuperación.
* Límites.
* Mensajes de estado.

---

## Fase 4 — Alimentación

Implementar:

* Botón de comida.
* Petición cada 6 horas.
* Contador de solicitudes.
* Solicitudes ignoradas.
* Sobrealimentación.
* Transformación en fantasma.

---

## Fase 5 — Eventos

Implementar como mínimo:

1. Baño.
2. Juego.
3. Cantar.
4. Bailar.
5. Dormir.

Opcional:

6. Atención.
7. Paseo/interacción.
8. Evento especial.

---

## Fase 6 — Animaciones

Implementar:

* Idle.
* Comer.
* Jugar.
* Limpiar.
* Cantar.
* Bailar.
* Dormir.
* Fantasma.

---

## Fase 7 — Audio

Implementar:

* Música.
* Sonidos.
* Toggle de audio.
* Feedback sonoro de eventos.

---

## Fase 8 — Estadísticas

Implementar:

* Registro de acciones.
* Registro de eventos.
* Registro de peticiones.
* Registro de estados.
* Datos finales.

---

## Fase 9 — Final

Implementar:

* Detección de 24 horas.
* Congelación de partida.
* Modal centrado.
* Resumen.
* Estadísticas.
* Mensaje final.

---

## Fase 10 — Pulido

Revisar:

* Responsive.
* Animaciones.
* Sonidos.
* Feedback.
* Errores.
* Balance.
* Accesibilidad.
* Rendimiento.

---

# 38. Criterios de aceptación

El MVP se considerará terminado cuando:

* [ ] Se pueda introducir el nombre de la mascota.
* [ ] El nombre aparezca durante la partida.
* [ ] Exista reloj visible.
* [ ] 6 segundos reales equivalgan a 1 hora simulada.
* [ ] La partida dure 24 horas simuladas.
* [ ] Exista hambre.
* [ ] Exista diversión.
* [ ] Exista higiene.
* [ ] Exista felicidad.
* [ ] La mascota solicite comida cada 6 horas.
* [ ] Dos solicitudes ignoradas provoquen transformación en fantasma.
* [ ] Tres sobrealimentaciones consecutivas provoquen transformación en fantasma.
* [ ] Existan al menos 5 eventos aleatorios.
* [ ] Cada evento tenga una acción correspondiente.
* [ ] Existan botones para las acciones principales.
* [ ] Existan mensajes/tarjetas de estado.
* [ ] La mascota tenga animaciones.
* [ ] Existan efectos visuales.
* [ ] Existan sonidos.
* [ ] Exista música.
* [ ] El personaje tenga diseño 8-bit original.
* [ ] Se registren estadísticas.
* [ ] Al llegar a 24 horas aparezca un popup centrado.
* [ ] El popup muestre el resumen de cuidado.
* [ ] Exista README.md.
* [ ] El proyecto sea responsive.
* [ ] No existan errores críticos en consola.

---

# 39. Resultado esperado

El resultado final deberá sentirse como una **pequeña experiencia jugable completa**, no simplemente como un formulario con barras.

La experiencia ideal será:

```text
CREAR MASCOTA
      ↓
CONOCERLA
      ↓
CUIDARLA
      ↓
RESPONDER EVENTOS
      ↓
VER CAMBIAR SUS ESTADOS
      ↓
EVITAR QUE SE CONVIERTA EN FANTASMA
      ↓
SOBREVIVIR 24 HORAS
      ↓
RECIBIR RESUMEN
```

La prioridad del proyecto será:

**claridad + personalidad + feedback + sencillez + sensación de videojuego.**
