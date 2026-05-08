"use client";

import { useState } from "react";
import { InfoModal } from "./InfoModal";
import { getModel } from "../lib/predict";

export function MethodologyPanel() {
  const [modal, setModal] = useState<string | null>(null);
  const model = getModel();

  return (
    <section className="methodCard">
      <div className="sectionHeading">
        <span>Marco metodológico</span>
        <p>Elementos centrales del modelo usado por la aplicación.</p>
      </div>

      <div className="infoGrid">
        <button onClick={() => setModal("validacion")}>Validación intercohortes</button>
        <button onClick={() => setModal("calibracion")}>Calibración y probabilidad</button>
        <button onClick={() => setModal("rf10")}>RF<sub>10</sub></button>
        <button onClick={() => setModal("uso")}>Uso responsable</button>
      </div>

      <div className="modelFacts">
        <div><span>Modelo</span><strong>{model.metadata.modelo}</strong></div>
        <div><span>Muestra analítica</span><strong>{Number(model.metadata.n_muestra_analitica).toLocaleString("es-CL")}</strong></div>
        <div><span>Prevalencia global</span><strong>{(100 * Number(model.metadata.prevalencia_global)).toFixed(1)}%</strong></div>
        <div><span>Cohortes</span><strong>{model.metadata.cohortes_disponibles}</strong></div>
      </div>

      <InfoModal title="Validación temporal intercohortes" open={modal === "validacion"} onClose={() => setModal(null)}>
        <p>
          El modelo del estudio se evaluó dejando una cohorte fuera en cada iteración. En cada partición se ajustó con las cohortes restantes y se evaluó sobre la cohorte excluida. Esta estrategia permite analizar estabilidad entre cohortes, aunque no equivale a una validación prospectiva estricta entrenada solo con años anteriores.
        </p>
      </InfoModal>

      <InfoModal title="Calibración y probabilidades" open={modal === "calibracion"} onClose={() => setModal(null)}>
        <p>
          La aplicación utiliza el modelo ridge final entrenado con toda la muestra analítica. La probabilidad resultante debe leerse como una estimación orientativa de riesgo bajo las reglas del modelo. En el estudio, la recalibración interna del ridge no mejoró Brier ni log-loss, por lo que la escala probabilística se consideró razonablemente estable.
        </p>
      </InfoModal>

      <InfoModal title="Razón de focalización RF10" open={modal === "rf10"} onClose={() => setModal(null)}>
        <p>
          RF<sub>10</sub> compara la proporción de desertores en el 10% de mayor riesgo con la prevalencia global. Un valor cercano a 2 indica que el grupo priorizado concentra aproximadamente el doble de casos que una selección aleatoria del mismo tamaño. No implica detección exhaustiva de todos los casos.
        </p>
      </InfoModal>

      <InfoModal title="Uso responsable" open={modal === "uso"} onClose={() => setModal(null)}>
        <p>
          Esta herramienta tiene fines académicos y demostrativos. Su uso adecuado es apoyar procesos de acompañamiento estudiantil junto con información contextual y juicio profesional. No debe utilizarse para excluir, etiquetar o automatizar decisiones sobre estudiantes.
        </p>
      </InfoModal>
    </section>
  );
}
