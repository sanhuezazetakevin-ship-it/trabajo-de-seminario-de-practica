# DataAnalytics Suite | Plataforma Corporativa de Procesamiento & Análisis de Datos

> **Proyecto de Seminario de Práctica Profesional**  
> **Desarrollo:** Proyecto en Equipo &mdash; Equipo de Desarrollo  
> **Stack Tecnológico:** React 19, TypeScript, Vite, PapaParse, NumPy Engine & CSS Modular Architecture  

---

## 1. Ficha Técnica & Resumen Ejecutivo

**DataAnalytics Suite** es una plataforma web corporativa de alto rendimiento orientada a la ingesta masiva de datos en formato CSV, la depuración automática de registros inconsistentes, el cálculo cuantitativo estadístico avanzado y la generación de reportes ejecutivos exportables a PDF.

Diseñada bajo un enfoque de **Tema Oscuro Corporativo** (Obsidian & Navy Slate) y una arquitectura CSS modular, la plataforma procesa archivos tabulares en tiempo real dentro del cliente web utilizando Web Workers, eliminando cuellos de botella en el servidor principal y garantizando total privacidad y velocidad de cómputo.

| Parámetro | Especificación Técnica |
| :--- | :--- |
| **Autores** | Equipo de Desarrollo &mdash; Seminario de Práctica |
| **Contexto Académico** | Seminario de Práctica Profesional |
| **Core Frontend** | React 19 &amp; TypeScript (Tipado estricto) |
| **Build Engine** | Vite (Empaquetamiento HMR ultrarrápido) |
| **Procesamiento CSV** | PapaParse (Web Workers multihilo asíncronos) |
| **Motor Matemático** | Algoritmo NumPy Cuantitativo en $O(N)$ |
| **Diseño UX/UI** | Tema Oscuro Corporativo (Obsidian/Navy) &amp; CSS Modular |

---

## 2. Arquitectura de Ingeniería & Decisiones Técnicas

### A. Procesamiento Client-Side y Multihilo (Web Workers)
- **Privacidad Total de Datos:** Los datos corporativos jamás salen del navegador local ni se transfieren a servidores externos.
- **Latencia Cero:** Se eliminan los tiempos de espera de subida o descarga en la red.
- **Renderizado sin Congelamientos:** El análisis del CSV se ejecuta en segundo plano mediante `PapaParse` configurado con `worker: true`, manteniendo la interfaz fluida a 60 FPS.

### B. Arquitectura CSS Modular & Tema Oscuro Corporativo
- **Variables CSS globales (`:root`):** Definidas en `src/index.css` con la paleta de colores corporativos (`#0b0f17` Obsidian, `#131b2e` Navy Slate, `#3b82f6` Azul Eléctrico).
- **Archivos CSS por vista:** Cada sección posee su propio archivo CSS (`Navbar.css`, `pandas.css`, `charts.css`), lo que evita interferencias de reglas entre componentes.
- **Eliminación Total de Emojis:** Sustituidos por badges e insignias tipográficas sobrias (`Módulo 01`, `Servicio 01`, `Canal Oficial`, etc.).

### C. Tipado Estricto en TypeScript
- Interfaces explícitas (`User`, `PandasProps`, `NumpyProps`, `ChartsProps`) para garantizar la integridad del flujo de datos sin errores de ejecución.

---

## 3. Requerimientos Tecnológicos

| Componente / Herramienta | Versión Mínima / Especificación |
| :--- | :--- |
| **Node.js** | v18.0.0 o superior |
| **npm** | v9.0.0 o superior |
| **Navegadores Compatibles** | Google Chrome (v110+), Mozilla Firefox (v110+), Microsoft Edge (v110+), Safari (v16+) |
| **Resolución Optimizada** | 1280 &times; 720 px en adelante (Diseño Responsivo) |

---

## 4. Dependencias del Proyecto

### Dependencias de Producción

| Paquete | Versión | Descripción |
| :--- | :--- | :--- |
| `react` | `^19.2.8` | Librería principal de construcción de interfaz de usuario |
| `react-dom` | `^19.2.8` | Renderizador DOM para React 19 |
| `react-router-dom` | `^7.18.2` | Enrutamiento SPA con soporte para layouts protegidos |
| `papaparse` | `^5.6.0` | Parser CSV de alta velocidad basado en Web Workers |
| `xlsx` | `^0.18.5` | Procesamiento de hojas de cálculo y exportación de archivos |

### Dependencias de Desarrollo

| Paquete | Versión | Descripción |
| :--- | :--- | :--- |
| `vite` | `^8.2.0` | Build tool y servidor de desarrollo HMR ultrarrápido |
| `typescript` | `~6.0.2` | Compilador de TypeScript para verificación estática de tipos |
| `@vitejs/plugin-react` | `^6.0.4` | Plugin oficial de React para Vite |
| `@types/react` | `^19.2.17` | Definiciones de tipos para React |
| `@types/react-dom` | `^19.2.3` | Definiciones de tipos para React DOM |
| `@types/papaparse` | `^5.5.2` | Definiciones de tipos para PapaParse |
| `@types/node` | `^24.13.3` | Definiciones de tipos de Node.js |
| `eslint` | `^10.8.0` | Linter de código JavaScript / TypeScript |

---

## 5. Guía de Instalación & Ejecución

### 1. Clonar o Ubicar la Carpeta del Proyecto
```bash
cd c:\Users\Gabriel\Desktop\trabajo-de-seminario-de-practica
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Ejecutar Servidor de Desarrollo
```bash
npm run dev
```
Accede al entorno local ingresando a la URL indicada en la consola (por defecto: `http://localhost:5173`).

### 4. Compilar para Producción
```bash
npm run build
```

### 5. Previsualizar Build de Producción
```bash
npm run preview
```

---

## 6. Estructura del Código Fuente

```text
trabajo-de-seminario-de-practica/
├── index.html                  # HTML5 Entry Point corporativo (lang="es")
├── package.json                # Configuración de scripts y dependencias
├── tsconfig.json               # Configuración principal de TypeScript
├── vite.config.ts              # Configuración del empaquetador Vite
├── README.md                   # Documentación oficial del proyecto
└── src/
    ├── main.tsx                # Punto de entrada de React 19 y Router
    ├── App.tsx                 # Contenedor raíz de rutas
    ├── index.css               # Variables CSS globales (:root), reset y primitivas
    ├── components/             # Componentes estructurales de UI
    │   ├── Navbar.tsx          # Header sticky corporativo con insignias
    │   ├── Navbar.css          # Estilos propios de la barra de navegación
    │   ├── Footer.tsx          # Pie de página corporativo en 3 columnas
    │   └── Footer.css          # Estilos propios del pie de página
    ├── layouts/                # Plantillas de diseño
    │   └── MainLayouts.tsx     # Layout principal con Navbar + Outlet + Footer
    ├── pages/                  # Vistas y Módulos de la Aplicación
    │   ├── Home.tsx            # Landing Page y Hero ejecutiva
    │   ├── Home.css            # Estilos de Hero y grid de beneficios
    │   ├── About.tsx           # Ficha técnica, Misión y Seminario
    │   ├── About.css           # Estilos de tarjetas tecnológicas y misión
    │   ├── Service.tsx         # Catálogo de servicios numerados
    │   ├── Service.css         # Estilos del catálogo de servicios
    │   ├── Contact.tsx         # Canales oficiales y formulario
    │   ├── Contact.css         # Estilos de canales oficiales y formulario
    │   ├── login.tsx           # Vista de inicio de sesión
    │   ├── login.css           # Estilos de la tarjeta e insumos de login
    │   ├── DashBoard.tsx       # Layout del Dashboard con Sidebar
    │   ├── DashBoard.css       # Estilos del sidebar y layout del dashboard
    │   ├── pandas.tsx          # Módulo Ingesta CSV & Limpieza Nulos
    │   ├── pandas.css          # Estilos de dropzone CSV, limpieza y tabla
    │   ├── numphy.tsx          # Módulo Métricas Cuantitativas NumPy
    │   ├── numphy.css          # Estilos de tarjetas KPI y matriz analítica
    │   ├── charts.tsx          # Módulo Reportes, CSS Bar Charts & Export PDF
    │   └── charts.css          # Estilos de gráficos nativos CSS e impresión PDF
    ├── routes/                 # Configuración de enrutamiento
    │   └── AppRoutes.tsx       # Definición de rutas públicas y protegidas
    └── types/                  # Interfaces y definiciones de TypeScript
        ├── auth.ts             # Tipos para autenticación y usuarios
        └── index.ts            # Tipos globales del dominio
```

---

## 7. Desglose Detallado Módulo por Módulo

### 1. Estructura y Navegación Base (`AppRoutes.tsx`, `Navbar.tsx`, `Footer.tsx`)
Administra el enrutamiento protegido y la sesión de usuario. Mantiene la barra superior sticky con la marca `DataAnalytics Suite` e indicadores visuales de pestaña activa, además del pie de página en 3 columnas acreditando al Equipo de Desarrollo.

### 2. Páginas Públicas Institucionales
- **Home (`Home.tsx` + `Home.css`):** Hero ejecutiva con subtítulo explicativo, llamadas a la acción (`Iniciar Dashboard`, `Explorar Servicios`) y grid de 3 tarjetas de beneficio (`Módulo 01`, `02`, `03`).
- **Nosotros (`About.tsx` + `About.css`):** Tarjetas tecnológicas (React 19, Vite, PapaParse/NumPy), Misión del Sistema y Ficha Académica del Equipo de Desarrollo.
- **Servicios (`Service.tsx` + `Service.css`):** Catálogo de servicios numerados (`Servicio 01` al `03`) con enlaces directos al panel.
- **Contacto (`Contact.tsx` + `Contact.css`):** Canales oficiales (Correo, Programa, Horario) y formulario estructurado con estado de confirmación.

### 3. Layout Dashboard (`DashBoard.tsx` + `DashBoard.css`)
Contenedor principal que almacena el estado global `csvData`. Posee un Sidebar responsivo para alternar entre submódulos y un widget en tiempo real que indica si hay datos cargados.

### 4. Módulo 1: Ingesta & Limpieza Pandas (`pandas.tsx` + `pandas.css`)
Dropzone interactivo en modo oscuro para cargar archivos CSV, algoritmo `cleanNulls()` que elimina filas vacías/nulas con mensajes de feedback, y tabla paginada (50, 100, 500 filas) con número correlativo y contador de `filas × columnas`.

### 5. Módulo 2: Análisis Cuantitativo NumPy (`numphy.tsx` + `numphy.css`)
Calcula en una sola pasada de memoria $O(N)$: Muestra Procesada ($N$), Promedio ($\mu$), Desviación Estándar ($\sigma$), Mediana (percentil 50 libre de sesgo), Mínimo y Máximo absoluto, acompañados de descripciones técnicas académicas.

### 6. Módulo 3: Reportes & Exportación PDF (`charts.tsx` + `charts.css`)
Barras distribucionales en CSS nativo con gradientes azules, mostrando porcentajes del total ($\%$) y registros absolutos. Integra `window.print()` con reglas `@media print` para exportar informes limpios a PDF.

---


## 8. Guion de Exposición Grupal Sugerido (3 a 5 Minutos)

1. **Introducción (Integrante 1 - 30s):**  
   *"Buenos días. Presentamos DataAnalytics Suite, una solución web corporativa desarrollada en equipo para el procesamiento y análisis de datos en tiempo real construida sobre React 19 y TypeScript..."*
2. **Arquitectura y Seguridad (Integrante 2 - 1m):**  
   *"Una ventaja clave de nuestra arquitectura es el procesamiento en el cliente mediante Web Workers. Esto garantiza que la información confidencial de la empresa nunca abandone el navegador..."*
3. **Demostración de Módulos (Integrante 3 - 2m):**  
   *"En el Módulo Pandas importamos el CSV y eliminamos registros inconsistentes. Luego, en el Módulo NumPy evaluamos la muestra obteniendo la media y la desviación estándar. Finalmente, en Reportes generamos gráficos de distribución y exportamos el informe a PDF..."*
4. **Conclusión (Todos / Integrante 1 - 30s):**  
   *"En conclusión, DataAnalytics Suite combina velocidad, privacidad y calidad estética en Tema Oscuro Corporativo..."*

---

&copy; 2026 **DataAnalytics Suite**. Proyecto desarrollado en equipo para el **Seminario de Práctica Profesional**.
