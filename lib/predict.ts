import modelData from "../data/model_ridge_web.json";

export type ModelData = typeof modelData;
export type FormValues = Record<string, string | number>;

export type PredictionResult = {
  probability: number;
  eta: number;
  prevalence: number;
  top10Cutoff: number;
  isTop10: boolean;
  riskBand: "Bajo" | "Intermedio" | "Priorizado";
  riskMessage: string;
  featureVector: Record<string, number>;
  contributions: Array<{ variable: string; value: number; beta: number; contribution: number }>;
};

const rawScoreVariables = [
  "adm_lenguaje",
  "adm_matematica",
  "adm_psu_promedio",
  "adm_psu_ponderado"
];

const directNumericVariables = [
  "edad",
  "adm_nem_notas",
  "adm_nem_puntaje",
  "adm_ranking"
];

const categoricalVariables = [
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

const rawToModelVariable: Record<string, string> = {
  adm_lenguaje: "adm_lenguaje_norm",
  adm_matematica: "adm_matematica_norm",
  adm_psu_promedio: "adm_psu_promedio_norm",
  adm_psu_ponderado: "adm_psu_ponderado_norm"
};

export function getModel() {
  return modelData;
}

export function getAvailableCohorts(): number[] {
  return modelData.metadata.cohortes_disponibles
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((x) => Number.isFinite(x));
}

export function getLevels(variable: string): string[] {
  return modelData.niveles_modelo
    .filter((row) => row.variable === variable)
    .map((row) => row.nivel_modelo);
}

export function getValidationTop10Cutoff(): number {
  const row = modelData.punto_corte_top10.find(
    (r) => r.fuente === "validacion_intercohortes_ridge_sin_recalibracion"
  );
  return Number(row?.corte_top10 ?? 0.298);
}

export function getPrevalence(): number {
  return Number(modelData.metadata.prevalencia_global);
}

function asNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

function sigmoid(eta: number): number {
  if (eta >= 0) {
    const z = Math.exp(-eta);
    return 1 / (1 + z);
  }
  const z = Math.exp(eta);
  return z / (1 + z);
}

function normalizeRawScore(rawVariable: string, rawValue: unknown, cohort: number): number {
  const modelVariable = rawToModelVariable[rawVariable];
  const fallback = Number(modelData.medianas[modelVariable as keyof typeof modelData.medianas] ?? 0);
  const value = asNumber(rawValue, Number.NaN);

  if (!Number.isFinite(value)) return fallback;

  const params = modelData.score_params_por_cohorte.find(
    (row) => Number(row.cohorte) === cohort && row.variable_raw === rawVariable
  );

  if (!params) return fallback;

  const sd = Number(params.desviacion_estandar);
  const mu = Number(params.media);
  if (!Number.isFinite(sd) || sd === 0 || !Number.isFinite(mu)) return fallback;

  return (value - mu) / sd;
}

function applyCategoricalMapping(
  vector: Record<string, number>,
  variable: string,
  selectedLevel: string
): void {
  const allowedLevels = getLevels(variable);
  const normalizedLevel = allowedLevels.includes(selectedLevel) ? selectedLevel : "otros";

  for (const row of modelData.dummy_mapping) {
    if (row.variable === variable && row.nivel_modelo === normalizedLevel) {
      vector[row.columna] = Number(row.valor);
    }
  }
}

function applySplineBasis(vector: Record<string, number>, cohort: number): void {
  const row = modelData.spline_basis_cohorte.find((r) => Number(r.cohorte) === cohort);
  if (!row) return;

  for (const [key, value] of Object.entries(row)) {
    if (key !== "cohorte") {
      vector[key] = Number(value);
    }
  }
}

export function predict(values: FormValues): PredictionResult {
  const cohorts = getAvailableCohorts();
  const defaultCohort = cohorts[cohorts.length - 1];
  const cohortCandidate = asNumber(values.cohorte, defaultCohort);
  const cohort = cohorts.includes(cohortCandidate) ? cohortCandidate : defaultCohort;

  const vector: Record<string, number> = {};
  for (const col of modelData.columnas_diseno) vector[col] = 0;

  for (const variable of directNumericVariables) {
    const fallback = Number(modelData.medianas[variable as keyof typeof modelData.medianas] ?? 0);
    vector[variable] = asNumber(values[variable], fallback);
  }

  for (const rawVariable of rawScoreVariables) {
    const modelVariable = rawToModelVariable[rawVariable];
    vector[modelVariable] = normalizeRawScore(rawVariable, values[rawVariable], cohort);
  }

  for (const variable of categoricalVariables) {
    const selected = String(values[variable] ?? getLevels(variable)[0] ?? "desconocido");
    applyCategoricalMapping(vector, variable, selected);
  }

  applySplineBasis(vector, cohort);

  const coefficients = modelData.coeficientes as Record<string, number>;
  let eta = Number(coefficients["(Intercept)"] ?? 0);
  const contributions: PredictionResult["contributions"] = [];

  for (const col of modelData.columnas_diseno) {
    const x = Number(vector[col] ?? 0);
    const beta = Number(coefficients[col] ?? 0);
    const contribution = x * beta;
    eta += contribution;
    if (Math.abs(contribution) > 0.0001) {
      contributions.push({ variable: col, value: x, beta, contribution });
    }
  }

  const probability = sigmoid(eta);
  const prevalence = getPrevalence();
  const top10Cutoff = getValidationTop10Cutoff();
  const isTop10 = probability >= top10Cutoff;

  let riskBand: PredictionResult["riskBand"] = "Bajo";
  let riskMessage = "Riesgo estimado bajo la prevalencia global observada en la muestra analítica.";

  if (isTop10) {
    riskBand = "Priorizado";
    riskMessage = "El caso se ubica en el rango de priorización equivalente al 10% superior de riesgo usado en la validación intercohortes.";
  } else if (probability >= prevalence) {
    riskBand = "Intermedio";
    riskMessage = "Riesgo estimado por sobre la prevalencia global, pero fuera del punto de corte del 10% superior.";
  }

  contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return {
    probability,
    eta,
    prevalence,
    top10Cutoff,
    isTop10,
    riskBand,
    riskMessage,
    featureVector: vector,
    contributions: contributions.slice(0, 12)
  };
}

export const variableLabels: Record<string, string> = {
  cohorte: "Cohorte de ingreso",
  sexo: "Sexo",
  edad: "Edad al ingreso",
  adm_nem_notas: "Promedio NEM",
  adm_nem_puntaje: "Puntaje NEM",
  adm_ranking: "Ranking escolar",
  adm_lenguaje: "Puntaje Lenguaje / Competencia lectora",
  adm_matematica: "Puntaje Matemática",
  adm_psu_promedio: "Promedio de puntajes de admisión",
  adm_psu_ponderado: "Puntaje ponderado de admisión",
  adm_quintil: "Quintil",
  adm_gratuidad: "Gratuidad",
  dependencia_educacional: "Dependencia educacional",
  vive_padres: "Vive con padres",
  vive_solo: "Vive solo/a",
  pc_propio: "Computador propio",
  pc_publico: "Acceso a computador público",
  acceso_internet: "Acceso a internet",
  sede_carrera: "Sede",
  oferta_nombre_carrera_area: "Área o carrera de ingreso"
};

export const numericDefaults: Record<string, number> = {
  edad: 19,
  adm_nem_notas: 6.03,
  adm_nem_puntaje: 633,
  adm_ranking: 659,
  adm_lenguaje: 600,
  adm_matematica: 600,
  adm_psu_promedio: 600,
  adm_psu_ponderado: 620
};
