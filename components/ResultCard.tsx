"use client";

import type { PredictionResult } from "../lib/predict";

function percent(x: number, digits = 1) {
  return `${(100 * x).toFixed(digits)}%`;
}

function formatContribution(name: string) {
  return name
    .replaceAll("_", " ")
    .replace("adm ", "adm. ")
    .replace("psu", "puntaje")
    .replace("splines::ns(cohorte, df = 3)", "tendencia cohorte ");
}

export function ResultCard({ result }: { result: PredictionResult | null }) {
  if (!result) {
    return (
      <aside className="resultCard emptyState">
        <h2>Resultado</h2>
        <p>Complete el formulario y presione “Calcular riesgo” para obtener una probabilidad estimada.</p>
      </aside>
    );
  }

  return (
    <aside className={`resultCard band${result.riskBand}`}>
      <div className="resultHeader">
        <div>
          <span className="eyebrow">Probabilidad estimada</span>
          <h2>{percent(result.probability, 1)}</h2>
        </div>
        <div className="riskBadge">{result.riskBand}</div>
      </div>

      <div className="metricGrid">
        <div>
          <span>Prevalencia global</span>
          <strong>{percent(result.prevalence, 1)}</strong>
        </div>
        <div>
          <span>Corte top 10%</span>
          <strong>{percent(result.top10Cutoff, 1)}</strong>
        </div>
        <div>
          <span>Eta lineal</span>
          <strong>{result.eta.toFixed(3)}</strong>
        </div>
      </div>

      <p className="riskMessage">{result.riskMessage}</p>

      <div className="warningBox">
        Esta estimación es un apoyo académico demostrativo. No constituye diagnóstico individual ni debe usarse como criterio automático de clasificación, exclusión o intervención.
      </div>

      <div className="contribBox">
        <h3>Principales contribuciones al puntaje lineal</h3>
        <p>Se muestran solo aportes numéricos del modelo. No deben interpretarse como efectos causales.</p>
        <ul>
          {result.contributions.slice(0, 8).map((item) => (
            <li key={item.variable}>
              <span>{formatContribution(item.variable)}</span>
              <strong>{item.contribution >= 0 ? "+" : ""}{item.contribution.toFixed(3)}</strong>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
