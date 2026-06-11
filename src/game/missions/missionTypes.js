export const MISSION_TYPES = {
  rescue: { title: 'Rescate normal', description: 'Atrapa todos los michis perdidos.' },
  golden: { title: 'Michi especial', description: 'Encuentra y atrapa al Michi Dorado.' },
  time_attack: { title: 'Carrera contra reloj', description: 'Atrapa los michis antes de que se acabe el tiempo.' },
  exploration: { title: 'Exploración', description: 'Activa las campanitas antes de capturar.' },
  careful: { title: 'Cuidado', description: 'Evita peligros y conserva tus corazones.' },
  fog: { title: 'Niebla', description: 'El radar solo muestra michis cercanos.' },
  slow_zone: { title: 'Lago / Playa', description: 'Cruza zonas suaves que reducen tu velocidad.' },
  city_hide: { title: 'Ciudad', description: 'Busca michis entre callecitas y escondites.' },
  mountain_jump: { title: 'Montaña', description: 'Usa saltos y plataformas suaves para explorar.' },
  city_quest: { title: 'Misión de ciudad', description: 'Entra a las casitas, encuentra los tesoros y vuelve a la plaza.' },
  vehicle_dash: { title: 'Carrera kawaii', description: 'Súbete a un vehículo y cruza los anillos antes de que acabe el tiempo.' },
  escape: { title: 'Escape de michis', description: 'Llega al portal o sobrevive 45 segundos.' },
  finale: { title: 'Villa final', description: 'Rescate épico final con Michi Dorado y celebración.' }
};

export const getMissionCopy = (missionType) => MISSION_TYPES[missionType] ?? MISSION_TYPES.rescue;
