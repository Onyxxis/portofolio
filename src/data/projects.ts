export type Project = {
  title: string;
  year: string;
  tags: string[];
  /** image dans public/projects/ (16:10 de préférence) */
  image: string;
  /** optionnel : vidéo dans public/projects/, jouée au survol */
  video?: string;
  /** optionnel : lien vers le projet */
  href?: string;
  fr: string;
  en: string;
};

// TODO: remplace par tes vrais projets. Les images vont dans public/projects/
export const PROJECTS: Project[] = [
  {
    title: 'Organyx',
    year: '2026',
    tags: ['Laravel', 'Web'],
    image: '/projects/organyx.jpg',
    fr: 'Plateforme de gestion de tâches en entreprise, avec groupes siège et succursales et rôles.',
    en: 'Company task-management platform with head-office and branch groups, and roles.',
  },
  {
    title: 'Application mobile',
    year: '2026',
    tags: ['Flutter', 'Mobile'],
    image: '/projects/mobile.jpg',
    fr: 'Application mobile développée avec Flutter.',
    en: 'Mobile application built with Flutter.',
  },
  { title: 'Projet 03', year: '2026', tags: ['React'], image: '/projects/projet-3.jpg', fr: 'Décris ici ton projet.', en: 'Describe your project here.' },
  { title: 'Projet 04', year: '2026', tags: ['Python'], image: '/projects/projet-4.jpg', fr: 'Décris ici ton projet.', en: 'Describe your project here.' },
  { title: 'Projet 05', year: '2026', tags: ['Laravel'], image: '/projects/projet-5.jpg', fr: 'Décris ici ton projet.', en: 'Describe your project here.' },
  { title: 'Projet 06', year: '2026', tags: ['Flutter'], image: '/projects/projet-6.jpg', fr: 'Décris ici ton projet.', en: 'Describe your project here.' },
];
