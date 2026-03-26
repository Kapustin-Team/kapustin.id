export interface Project {
  id: string;
  name: string;
  url: string;
  icon: string;
  description_en: string;
  description_ru: string;
}

export const projects: Project[] = [
  {
    id: 'kapustin-team',
    name: 'kapustin.team',
    url: 'https://kapustin.team',
    icon: '👥',
    description_en: 'Team portfolio',
    description_ru: 'Портфолио команды',
  },
  {
    id: 'aiacademe',
    name: 'aiacade.me',
    url: 'https://aiacade.me',
    icon: '🤖',
    description_en: 'AI Academy',
    description_ru: 'Академия ИИ',
  },
  {
    id: 'mediatower',
    name: 'mediatower.me',
    url: 'https://mediatower.me',
    icon: '📡',
    description_en: 'Media Tower',
    description_ru: 'Медиа Башня',
  },
  {
    id: 'notex',
    name: 'notex.pro',
    url: 'https://notex.pro',
    icon: '📝',
    description_en: 'Notes',
    description_ru: 'Заметки',
  },
  {
    id: 'flowork',
    name: 'flowork.ru',
    url: 'https://flowork.ru',
    icon: '⚡',
    description_en: 'Workflow',
    description_ru: 'Рабочие процессы',
  },
];
