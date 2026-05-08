# Aplicación académica de predicción de deserción temprana

Prototipo web basado en un modelo de regresión logística ridge entrenado con datos institucionales de cohortes 2014--2023.

## Propósito

La aplicación estima una probabilidad orientativa de deserción temprana antes del inicio del segundo año académico. Está pensada como apoyo demostrativo y académico vinculado al manuscrito, no como sistema institucional definitivo.

## Advertencia de uso

La probabilidad estimada no constituye diagnóstico individual ni debe usarse como criterio automático de clasificación, exclusión o intervención. Su uso adecuado es apoyar procesos de acompañamiento estudiantil junto con evaluación profesional e información contextual adicional.

## Archivos principales

- `data/model_ridge_web.json`: artefacto del modelo ridge final.
- `lib/predict.ts`: funciones de preprocesamiento y predicción.
- `components/PredictionForm.tsx`: formulario de entrada.
- `components/ResultCard.tsx`: visualización del resultado.
- `components/MethodologyPanel.tsx`: popups metodológicos.

## Ejecución local

```bash
npm install
npm run dev
```

Luego abrir:

```text
http://localhost:3000
```

## Despliegue en Vercel

1. Subir esta carpeta a un repositorio de GitHub.
2. Entrar a Vercel.
3. Importar el repositorio.
4. Framework: Next.js.
5. Deploy.

No se requiere backend ni Python para esta primera versión, porque la predicción ridge se calcula directamente desde `model_ridge_web.json`.

## Notas metodológicas

- El modelo usa coeficientes ridge exportados desde R.
- Los puntajes brutos se armonizan según cohorte usando z-score.
- La priorización top 10% usa el punto de corte proveniente de la validación temporal intercohortes.
- Las variables categóricas se codifican mediante el mapeo de dummies exportado desde R.
