// Índice principal del sistema de niveles dinámicos
// Exporta todos los componentes y hooks relacionados con niveles

export {
  default as levelSystem,
  useLevelSystem,
  useLevelUp,
} from "../levelSystem";
export { LevelUpModal } from "../LevelUpModal";
export { UserLevelDisplay } from "../UserLevelDisplay";
export { LevelSystemIntegration } from "../LevelSystemIntegration";

export type { Level, LevelUpEvent } from "../levelSystem";
