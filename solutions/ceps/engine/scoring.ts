export type AnswerMap = Record<number, number>;

export interface CepsScoreResult {
  scores: Record<string, number>;
  levelByComp: Record<string, string>;
  radarData: Array<{ subject: string; A: number; fullMark?: number }>;
  totalScore: number;
  overallLevel: string;
  correction: number;
}

export function calcCorreccion(answers: AnswerMap): number {
  // Items de corrección: 11, 22, 33, 44, 55
  const correctionItems = [11, 22, 33, 44, 55];
  const base = correctionItems.reduce(
    (acc, itemId) => acc + (answers[itemId] || 0),
    0,
  );

  if (base >= 20 && base <= 25) return 7;
  if (base >= 15) return 5;
  if (base >= 10) return 3;
  return 0;
}

export function computeCepsScores(answers: AnswerMap): CepsScoreResult {
  const getAnswer = (id: number): number => answers[id] || 0;

  // Cálculos por competencia (según fórmula CEPS original)
  const rawScores = [
    // Búsqueda de Iniciativas
    6 +
      getAnswer(1) +
      getAnswer(12) +
      getAnswer(23) +
      getAnswer(34) +
      getAnswer(45),

    // Persistencia
    6 +
      getAnswer(2) +
      getAnswer(13) +
      getAnswer(24) +
      getAnswer(35) +
      getAnswer(46),

    // Cumplimiento
    6 +
      getAnswer(3) +
      getAnswer(14) +
      getAnswer(25) +
      getAnswer(36) +
      getAnswer(47),

    // Orientación a la Calidad
    6 +
      getAnswer(4) +
      getAnswer(15) +
      getAnswer(26) +
      getAnswer(37) +
      getAnswer(48),

    // Análisis de Riesgos (items negativos: 5, 27)
    6 -
      getAnswer(5) +
      getAnswer(16) +
      getAnswer(27) +
      getAnswer(38) +
      getAnswer(49),

    // Fijación de Metas (item negativo: 6)
    6 -
      getAnswer(6) +
      getAnswer(17) +
      getAnswer(28) +
      getAnswer(39) +
      getAnswer(50),

    // Búsqueda de Información (items negativos: 18, 30)
    6 +
      getAnswer(7) -
      getAnswer(18) +
      getAnswer(29) +
      getAnswer(40) +
      getAnswer(51),

    // Planificación (item negativo: 30)
    6 +
      getAnswer(8) +
      getAnswer(19) -
      getAnswer(30) +
      getAnswer(41) +
      getAnswer(52),

    // Redes de Apoyo (item negativo: 9)
    6 -
      getAnswer(9) +
      getAnswer(20) +
      getAnswer(31) +
      getAnswer(42) +
      getAnswer(53),

    // Autoconfianza (item negativo: 10)
    6 -
      getAnswer(10) +
      getAnswer(21) +
      getAnswer(32) +
      getAnswer(43) +
      getAnswer(54),
  ];

  // Factor de corrección
  const correction = calcCorreccion(answers);

  // Puntuaciones finales
  const finalScores = rawScores.map((score) => Math.max(0, score - correction));

  const competencyNames = [
    "buscar_iniciativas",
    "persistencia",
    "cumplimiento",
    "calidad",
    "riesgos",
    "fijar_metas",
    "informacion",
    "planificacion",
    "redes",
    "autoconfianza",
  ];

  const competencyLabels = [
    "Búsqueda de Iniciativas",
    "Persistencia",
    "Cumplimiento",
    "Orientación a la Calidad",
    "Análisis de Riesgos",
    "Fijación de Metas",
    "Búsqueda de Información",
    "Planificación",
    "Redes de Apoyo",
    "Autoconfianza",
  ];

  // Función para determinar nivel
  const getLevel = (score: number): string => {
    if (score < 11) return "Bajo";
    if (score <= 18) return "Promedio";
    return "Alto";
  };

  // Crear objetos de resultados
  const scores = Object.fromEntries(
    competencyNames.map((name, index) => [name, finalScores[index]]),
  );

  const levelByComp = Object.fromEntries(
    competencyNames.map((name, index) => [name, getLevel(finalScores[index])]),
  );

  const radarData = competencyLabels.map((label, index) => ({
    subject: label,
    A: finalScores[index],
    fullMark: 25,
  }));

  // Cálculo de puntuación total y nivel general
  const totalScore = finalScores.reduce((sum, score) => sum + score, 0);
  const averageScore = totalScore / finalScores.length;
  const overallLevel = getLevel(averageScore);

  return {
    scores,
    levelByComp,
    radarData,
    totalScore,
    overallLevel,
    correction,
  };
}

export function getCompetencyRecommendation(
  competencyKey: string,
  level: string,
): string {
  const recommendations: Record<string, Record<string, string>> = {
    buscar_iniciativas: {
      Bajo: "Practica identificar oportunidades de mejora en tu entorno laboral. Comienza con pequeñas iniciativas.",
      Promedio:
        "Busca proyectos donde puedas liderar nuevas ideas y soluciones innovadoras.",
      Alto: "Comparte tu experiencia en identificación de oportunidades con tu equipo.",
    },
    persistencia: {
      Bajo: "Establece metas pequeñas y celebra los logros parciales para mantener la motivación.",
      Promedio:
        "Desarrolla estrategias para superar obstáculos y mantener el enfoque en objetivos de largo plazo.",
      Alto: "Usa tu persistencia para motivar a otros cuando enfrenten dificultades.",
    },
    cumplimiento: {
      Bajo: "Utiliza herramientas de organización y recordatorios para mejorar el seguimiento de compromisos.",
      Promedio:
        "Busca formas de asumir mayor responsabilidad en proyectos importantes.",
      Alto: "Considera roles de liderazgo donde tu confiabilidad sea un activo clave.",
    },
    calidad: {
      Bajo: "Establece estándares claros de calidad y busca retroalimentación constante.",
      Promedio:
        "Identifica procesos donde puedas implementar mejoras de calidad.",
      Alto: "Desarrolla sistemas de calidad que otros puedan adoptar.",
    },
    riesgos: {
      Bajo: "Practica evaluando pros y contras en decisiones pequeñas antes de aplicarlo a decisiones mayores.",
      Promedio:
        "Desarrolla marcos de análisis para evaluar riesgos de manera más sistemática.",
      Alto: "Comparte tu experiencia en análisis de riesgos para ayudar en decisiones estratégicas.",
    },
    fijar_metas: {
      Bajo: "Comienza con metas SMART (específicas, medibles, alcanzables, relevantes, temporales).",
      Promedio:
        "Conecta tus metas personales con objetivos organizacionales más amplios.",
      Alto: "Ayuda a otros a establecer y alcanzar metas efectivas.",
    },
    informacion: {
      Bajo: "Desarrolla hábitos de investigación antes de tomar decisiones importantes.",
      Promedio:
        "Amplía tus fuentes de información y mejora tu análisis de datos.",
      Alto: "Conviértete en referente de información para tu equipo o área.",
    },
    planificacion: {
      Bajo: "Utiliza herramientas de planificación simples y aumenta la complejidad gradualmente.",
      Promedio: "Incorpora análisis de contingencias en tus planes.",
      Alto: "Lidera iniciativas de planificación estratégica.",
    },
    redes: {
      Bajo: "Comienza construyendo relaciones dentro de tu equipo inmediato.",
      Promedio: "Expande tu red a diferentes áreas y niveles organizacionales.",
      Alto: "Facilita conexiones entre otros y actúa como conector en tu organización.",
    },
    autoconfianza: {
      Bajo: "Reflexiona sobre tus logros pasados y desarrolla una narrativa positiva sobre tus capacidades.",
      Promedio:
        "Busca desafíos que te permitan probar y expandir tus habilidades.",
      Alto: "Usa tu autoconfianza para tomar decisiones difíciles y liderar en situaciones complejas.",
    },
  };

  return (
    recommendations[competencyKey]?.[level] ||
    "Continúa desarrollando esta competencia."
  );
}

export function getOverallProfile(scores: Record<string, number>): string {
  const scoreValues = Object.values(scores);
  const average =
    scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length;

  // Identificar fortalezas (puntuaciones altas)
  const strengths = Object.entries(scores)
    .filter(([_, score]) => score >= 19)
    .map(([key, _]) => key);

  // Identificar áreas de mejora (puntuaciones bajas)
  const improvements = Object.entries(scores)
    .filter(([_, score]) => score <= 10)
    .map(([key, _]) => key);

  if (
    strengths.includes("buscar_iniciativas") &&
    strengths.includes("persistencia")
  ) {
    return "leader";
  } else if (
    strengths.includes("calidad") &&
    strengths.includes("cumplimiento")
  ) {
    return "perfectionist";
  } else if (strengths.includes("riesgos") && average >= 15) {
    return "risktaker";
  } else if (strengths.includes("redes")) {
    return "networker";
  } else if (improvements.length <= 1 && average >= 14) {
    return "balanced";
  }

  return "developing";
}
