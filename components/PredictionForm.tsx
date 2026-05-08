"use client";

import { getAvailableCohorts, getLevels, numericDefaults, variableLabels, type FormValues } from "../lib/predict";

const numericFields = [
  "edad",
  "adm_nem_notas",
  "adm_nem_puntaje",
  "adm_ranking",
  "adm_lenguaje",
  "adm_matematica",
  "adm_psu_promedio",
  "adm_psu_ponderado"
];

const categoricalFields = [
  "sexo",
  "adm_quintil",
  "adm_gratuidad",
  "dependencia_educacional",
  "vive_padres",
  "vive_solo",
  "pc_propio",
  "pc_publico",
  "acceso_internet",
  "sede_carrera",
  "oferta_nombre_carrera_area"
];

function prettyLevel(level: string) {
  if (level === "1") return "Sí / 1";
  if (level === "0") return "No / 0";
  if (level === "s/i" || level === "s i") return "Sin información";
  if (level === "NA") return "NA institucional";
  return level.replaceAll("_", " ");
}

export function defaultFormValues(): FormValues {
  const cohorts = getAvailableCohorts();
  const values: FormValues = {
    cohorte: cohorts[cohorts.length - 1]
  };

  for (const field of numericFields) values[field] = numericDefaults[field] ?? 0;

  for (const field of categoricalFields) {
    const levels = getLevels(field);
    values[field] = levels[0] ?? "desconocido";
  }

  // Defaults chosen as neutral/common examples; the user can change them.
  values.sexo = getLevels("sexo").includes("mujer") ? "mujer" : values.sexo;
  values.adm_quintil = getLevels("adm_quintil").includes("3") ? "3" : values.adm_quintil;
  values.adm_gratuidad = getLevels("adm_gratuidad").includes("1") ? "1" : values.adm_gratuidad;
  values.sede_carrera = getLevels("sede_carrera").includes("concepcion") ? "concepcion" : values.sede_carrera;
  values.oferta_nombre_carrera_area = getLevels("oferta_nombre_carrera_area").includes("educacion") ? "educacion" : values.oferta_nombre_carrera_area;

  return values;
}

export function PredictionForm({
  values,
  onChange,
  onSubmit,
  onReset
}: {
  values: FormValues;
  onChange: (values: FormValues) => void;
  onSubmit: () => void;
  onReset: () => void;
}) {
  function setValue(field: string, value: string | number) {
    onChange({ ...values, [field]: value });
  }

  return (
    <form className="formCard" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="sectionHeading">
        <span>Formulario de predicción</span>
        <p>Ingrese valores disponibles al momento de matrícula. Los puntajes brutos se armonizan internamente según cohorte.</p>
      </div>

      <div className="fieldGrid">
        <label className="field">
          <span>{variableLabels.cohorte}</span>
          <select value={String(values.cohorte)} onChange={(e) => setValue("cohorte", Number(e.target.value))}>
            {getAvailableCohorts().map((cohort) => (
              <option key={cohort} value={cohort}>{cohort}</option>
            ))}
          </select>
        </label>

        {numericFields.map((field) => (
          <label className="field" key={field}>
            <span>{variableLabels[field]}</span>
            <input
              type="number"
              step="0.01"
              value={String(values[field] ?? "")}
              onChange={(e) => setValue(field, e.target.value)}
            />
          </label>
        ))}

        {categoricalFields.map((field) => (
          <label className="field" key={field}>
            <span>{variableLabels[field]}</span>
            <select value={String(values[field] ?? "")} onChange={(e) => setValue(field, e.target.value)}>
              {getLevels(field).map((level) => (
                <option key={level} value={level}>{prettyLevel(level)}</option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="actions">
        <button className="primaryButton" type="submit">Calcular riesgo</button>
        <button className="secondaryButton" type="button" onClick={onReset}>Restablecer ejemplo</button>
      </div>
    </form>
  );
}
