# 🌌 AstroSphere — Observatorio & Simulador Espacial Interactivo

> **Tarea 19: Creación de Página Web utilizando IA**  
> **Asignatura:** IDT  
> **Estilos:** Tailwind CSS  
> **Año:** 2026

---

## 🚀 Sobre el Proyecto

**AstroSphere** es una experiencia web moderna e inmersiva centrada en la exploración espacial, la física orbital interactiva y la divulgación científica. Diseñada con una estética *Sci-Fi / Glassmorphism* de vanguardia, aprovecha al máximo **Tailwind CSS** para un diseño responsivo, fluido y ultra-estilizado, complementado con gráficos en tiempo real sobre **HTML5 Canvas** y síntesis sonora mediante la **Web Audio API**.

---

## ✨ Características y Módulos Principales

1. **🌌 Fondo Estelar Dinámico con Efecto Warp Drive (Canvas)**
   - Campo estelar en perspectiva 3D con más de 300 estrellas calculadas en tiempo real.
   - Parallax sutil con el movimiento del ratón.
   - Botón interactivo **"Warp Drive"** que activa el salto hiperespacial con estelas lumínicas.

2. **🪐 Laboratorio de Simulación Gravitacional Newtoniana**
   - Motor físico en tiempo real que implementa la Ley de Gravitación Universal ($F = G \frac{M \cdot m}{r^2}$).
   - Lanza satélites haciendo clic y arrastrando con el ratón para definir su vector de velocidad y dirección.
   - Alterna el cuerpo central entre un **Sol radiante** y un **Agujero Negro** con disco de acreción relativista.
   - Botón para autogenerar un sistema planetario armónico en órbitas keplerianas estables.
   - Detección de colisiones y absorción estelar.

3. **⚖️ Calculadora de Peso y Edad Cósmica**
   - Ingresa tu peso y edad terrenal para calcular en tiempo real tu biometría en 8 mundos del Sistema Solar (Mercurio, Venus, Luna, Marte, Júpiter, Saturno, Titán y Neptuno).
   - Incluye datos astrofísicos y curiosidades geológicas de cada astro.

4. **🛰️ Archivo de Misiones Espaciales con Fichas Técnicas (Modal)**
   - Catálogo interactivo de misiones históricas y vanguardistas (James Webb, Voyager 1, Artemis II, Perseverance, Hubble, Europa Clipper).
   - Filtrado dinámico por categorías (Telescopios, Sondas Deep Space, Misiones Tripuladas) y buscador en tiempo real.
   - Ventana modal interactiva con especificaciones técnicas detalladas (distancia operativa, masa, payload, agencias).

5. **🪪 Generador de Credencial / Pasaporte de Astronauta**
   - Personaliza tu identificación oficial de explorador de la Federación Solar.
   - Sincronización instantánea de nombre, rol de tripulante y colonia destino.
   - Selector de insignias holográficas.
   - Botón de generación aleatoria con rangos de tripulación y códigos cuánticos.
   - Función **"Imprimir Credencial"** optimizada con hoja de estilos `@media print` para exportar tu carnet.

6. **🎵 Sonido Ambiental Sintetizado Proceduralmente (Web Audio API)**
   - Sintetizador de drone espacial de baja frecuencia generado puramente con osciladores y filtros en JavaScript (sin archivos `.mp3` externos propensos a fallas o demoras de carga).

7. **📱 100% Responsivo**
   - Menú móvil adaptable, diseño adaptativo para pantallas ultra-wide, laptops, tablets y smartphones.

---

## 🛠️ Tecnologías Empleadas

- **HTML5 Semántico**: Estructura limpia y accesible.
- **Tailwind CSS 3.4+**: Sistema de diseño mediante utilidades, paleta de colores personalizada de temática espacial (*space-950, nebula-cyan, nebula-purple, nebula-pink*), transiciones y animaciones.
- **Vanilla JavaScript (ES6+)**: Física computacional en canvas, reactividad DOM y Web Audio API sin dependencias pesadas.
- **Lucide Icons**: Iconografía SVG moderna y minimalista.
- **Google Fonts**: Tipografías `Space Grotesk` (títulos display) y `Outfit` (lectura).

---

## 📖 Cómo Ejecutar el Proyecto

Puedes abrir el proyecto de forma inmediata de cualquiera de estas dos formas:

### Opción 1: Abrir directamente en el navegador
Haz doble clic en el archivo [`index.html`](file:///home/rafa/Escritorio/IDT/Tarea%2019/index.html) o ábrelo con tu navegador preferido (Chrome, Firefox, Edge, Brave).

### Opción 2: Servidor local ligero (Python)
Si prefieres servirlo mediante HTTP:
```bash
cd "/home/rafa/Escritorio/IDT/Tarea 19"
python3 -m http.server 8080
```
Luego accede en tu navegador a: `http://localhost:8080`

---

*Desarrollado con asistencia de Inteligencia Artificial para la Tarea 19.*
