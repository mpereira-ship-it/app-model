"use client";

import { useState } from "react";
import { MethodologyPanel } from "../components/MethodologyPanel";
import { PredictionForm, defaultFormValues } from "../components/PredictionForm";
import { ResultCard } from "../components/ResultCard";
import { predict, type FormValues, type PredictionResult } from "../lib/predict";

export default function Home() {
  const [values, setValues] = useState<FormValues>(() => defaultFormValues());
  const [result, setResult] = useState<PredictionResult | null>(null);

  function runPrediction() {
    setResult(predict(values));
  }

  function resetExample() {
    const defaults = defaultFormValues();
    setValues(defaults);
    setResult(null);
  }

  return (
    <main className="pageShell">
      <section className="hero">
        <div>
          <span className="eyebrow">Aplicación académica demostrativa</span>
          <h1>Predicción de deserción temprana universitaria</h1>
          <p>
            Prototipo web basado en un modelo de regresión logística ridge entrenado con cohortes de ingreso 2014–2023. La herramienta estima una probabilidad orientativa de deserción antes del inicio del segundo año académico. Patricia Letelier Sanz - Flavio Valassina Simonetta - Manuel Pereira Barahona
          </p>
        </div>
        <div className="heroCard">
          <span>Uso recomendado</span>
          <p>Apoyo a priorización de acompañamiento estudiantil, no clasificación automática.</p>
        </div>
      </section>

      <section className="layoutGrid">
        <div className="leftStack">
          <PredictionForm values={values} onChange={setValues} onSubmit={runPrediction} onReset={resetExample} />
          <MethodologyPanel />
        </div>
        <ResultCard result={result} />
      </section>

      <section className="paperNote">
        <h2>Nota académica</h2>
        <p>
          La aplicación reproduce una versión de despliegue del modelo ridge final. En el artículo, el desempeño se evaluó mediante validación temporal intercohortes. XGBoost obtuvo mejores métricas agregadas, pero las diferencias respecto de ridge fueron pequeñas; por ello, ridge se usa aquí por su equilibrio entre desempeño, parsimonia e interpretabilidad.
        </p>
      </section>
    </main>
  );
}
