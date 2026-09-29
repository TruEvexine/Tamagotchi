# DESIGN.md — Tamagotchi Web

## Dirección general
Tamagotchi Web debe sentirse como una pequeña consola virtual retro dentro del navegador.

Estética:
- Pixel art
- 8-bit
- Mascota adorable
- Interfaz limpia
- Colores vivos
- Microanimaciones
- Feedback audiovisual

No debe parecer un dashboard empresarial.

## Jerarquía visual
```text
MASCOTA
↓
ESTADO ACTUAL
↓
NECESIDADES
↓
ACCIONES
↓
EVENTOS
```

La mascota es el elemento visual protagonista.

## Estilo 8-bit
Usar bordes definidos, formas simples, pixel art visible, paleta limitada e iconografía sencilla.

Evitar glassmorphism, realismo, sombras fotográficas, UI corporativa y exceso de gradientes modernos.

## Mascota
Debe tener silueta sencilla, cara expresiva, ojos grandes, pocos colores y animaciones de pocos frames.

## Estados
### Idle
Respiración mediante pequeño movimiento vertical.

### Feliz
Sonrisa, pequeño salto y corazones/estrellas.

### Hambrienta
Expresión triste, movimiento sutil, icono de comida y mensaje.

### Aburrida
Mirada apagada, animación lenta y posible burbuja de pensamiento.

### Sucia
Partículas pequeñas, expresión incómoda e icono de limpieza.

### Comiendo
Movimiento hacia la comida y masticación de 0.5–1.5 s.

### Jugando
Movimiento energético, saltos y partículas.

### Cantando
Movimiento de boca/cuerpo y notas musicales.

### Bailando
```text
izquierda → centro → derecha → centro
```

### Durmiendo
Ojos cerrados, movimiento mínimo y `Z` pixeladas.

### Fantasma
Sprite fantasma, flotación, partículas y feedback audiovisual especial.

## Layout
La composición debe ser centrada y clara:

```text
┌────────────────────────────────────────┐
│              TAMAGOTCHI                │
│         🕐 08:00 / 24:00               │
│              [ MASCOTA ]               │
│          ❤️ Estoy feliz                │
│ 🍗 Hambre       ████████░░             │
│ 🎮 Diversión    ██████░░░░             │
│ 🧼 Higiene      █████████░             │
│ ❤️ Felicidad    ████████░░             │
│ [🍎 COMIDA]     [🎮 JUGAR]             │
│ [🧼 LIMPIAR]    [❤️ ATENCIÓN]          │
│          ┌────────────────┐            │
│          │ EVENTO ACTIVO  │            │
│          │ [ RESPONDER ]  │            │
│          └────────────────┘            │
└────────────────────────────────────────┘
```

## Estadísticas
Mostrar `icono + nombre + barra + valor`. Las barras deben distinguir alto, medio, bajo y crítico sin depender solo del color.

## Botones
Deben parecer botones de videojuego: bordes definidos, icono + acción, hover, pressed y disabled. Un pressed puede usar `scale(0.96)` durante un instante.

## Eventos
Los eventos deben destacar mediante bounce, glow, partículas o sonido, sin bloquear innecesariamente toda la pantalla.

## Mensajes
Usar lenguaje de mascota, no mensajes técnicos. Ejemplo: `🍗 Tengo mucha hambre...`

## Feedback
Cada acción importante debería producir al menos dos señales entre visual, animación, audio y texto.

## Microanimaciones orientativas
- Botón: 100–180 ms
- Feedback: 200–400 ms
- Cambio de estado: 300–600 ms
- Evento: 400–800 ms

## Partículas
Usarlas con moderación: comida, felicidad, juego, canto y fantasma.

## Modal final
Debe ser una tarjeta centrada, responsive, legible y con estética pixel art. Debe mostrar nombre, estado, estadísticas y mensaje final.

## Tipografía
Pixel/retro para títulos cuando sea posible, pero siempre legible para información importante.

## Paleta
Mantener una paleta limitada: principal, secundaria, fondo, panel, texto, positivo, advertencia y crítico. Mantener contraste suficiente.

## Responsive
En móvil priorizar:
```text
mascota
↓
estado
↓
estadísticas
↓
acciones
↓
evento
```

## Audio UX
Música discreta y efectos cortos para acciones, eventos, advertencias, éxito, fantasma y final.

## Sensación de juego
El usuario debe sentir que está cuidando una criatura, no llenando cuatro barras. Las estadísticas deben estar acompañadas de expresiones, mensajes, animaciones, eventos, sonidos y consecuencias.

## Regla de consistencia
Todo elemento nuevo debe responder:
> ¿Esto hace que la mascota se sienta más viva?

Si no, cuestionar si es necesario para el MVP.
