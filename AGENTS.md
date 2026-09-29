# AGENTS.md — Tamagotchi Web

## Propósito
Reglas para agentes de IA y desarrolladores que trabajen en Tamagotchi Web.

## Documentos de referencia
Antes de modificar el proyecto, revisar:
- `PLAN.md`
- `DESIGN.md`
- `README.md`

Jerarquía: requisitos explícitos del usuario → `PLAN.md` → `DESIGN.md` → `README.md` → decisiones internas.

## REGLA IMPORTANTE: NO CREAR OTRO README
El proyecto debe tener un único `README.md` principal.

El agente:
- NO debe crear `README_2.md`.
- NO debe crear `README_NEW.md`.
- NO debe crear `README_UPDATED.md`.
- NO debe crear READMEs dentro de carpetas.
- NO debe duplicar la documentación general en otro README.

Si hay que actualizar documentación general, **editar el `README.md` existente**.

La documentación técnica adicional solo debe crearse si es realmente necesaria y con nombres específicos como `ARCHITECTURE.md`, `AUDIO.md` o `ASSETS.md`.

## Alcance
No agregar sin autorización:
- cuentas/login
- backend/base de datos
- multiplayer
- tienda/monedas
- inventario complejo
- niveles/experiencia
- combate
- microtransacciones/publicidad
- IA compleja
- sistemas sociales

## Reglas críticas
- 6 segundos reales = 1 hora simulada.
- 24 horas simuladas = 144 segundos reales.
- Cada 6 horas simuladas se solicita comida.
- 2 solicitudes de comida ignoradas = fantasma.
- 3 sobrealimentaciones consecutivas = fantasma.
- Al llegar a 24 horas termina la partida.

## Arquitectura
Mantener separadas, cuando sea razonable:
`Game State`, `Game Clock`, `Pet Logic`, `Event System`, `Statistics`, `UI`, `Audio`, `Animation`.

La UI no debe ser la fuente de verdad del estado.

## Eventos
Definir eventos de forma configurable, por ejemplo:

```js
{
  id: "play",
  message: "¡Quiero jugar!",
  action: "JUGAR",
  effects: { fun: 25, happiness: 10 }
}
```

## Personaje
Debe ser original, 8-bit/pixel art y no copiar personajes o sprites protegidos.

## Código
Preferir nombres descriptivos, funciones pequeñas, constantes centralizadas y componentes reutilizables. Evitar duplicación, valores mágicos y dependencias innecesarias.

## Audio
La música y los sonidos deben poder desactivarse. No asumir autoplay del navegador: iniciar audio después de interacción cuando corresponda.

## Responsive
Probar Desktop, Laptop, Tablet y Mobile.

## Pruebas mínimas
Comprobar 0h/6h/12h/18h/24h; comida normal; sobrealimentación; dos solicitudes ignoradas; tres sobrealimentaciones; eventos resueltos/ignorados; final y estadísticas.

## Antes de terminar
- [ ] Funcionalidad implementada.
- [ ] No rompió otra funcionalidad.
- [ ] Sigue `PLAN.md`.
- [ ] Sigue `DESIGN.md`.
- [ ] No creó otro README.
- [ ] No añadió dependencias innecesarias.
- [ ] No dejó archivos de prueba/debug innecesarios.
- [ ] El proyecto ejecuta correctamente.

El proyecto debe sentirse como una pequeña mascota virtual jugable y pulida, no como una demo técnica de barras de progreso.
