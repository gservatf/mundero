export const mockApps = [
  {
    id: '1',
    name: 'LEGALITY360°',
    description: 'Sistema de gestión legal y compliance',
    icon_url: '/icons/legality360.svg',
    app_url: 'https://legality360.com',
    roles_available: ['user', 'manager', 'admin'],
    is_active: true,
    access_status: 'granted',
    user_role: 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'We Consulting',
    description: 'Consultoría empresarial y estratégica',
    icon_url: '/icons/we-consulting.svg',
    app_url: 'https://weconsulting.work',
    roles_available: ['user', 'manager', 'admin'],
    is_active: true,
    access_status: 'pending',
    user_role: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Studio41',
    description: 'Estudio de diseño y creatividad',
    icon_url: '/icons/studio41.svg',
    app_url: 'https://studio41.agency',
    roles_available: ['user', 'manager', 'admin'],
    is_active: true,
    access_status: 'denied',
    user_role: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Pitahaya',
    description: 'Plataforma de gestión de proyectos',
    icon_url: '/icons/pitahaya.svg',
    app_url: 'https://pitahaya.com',
    roles_available: ['user', 'manager', 'admin'],
    is_active: true,
    access_status: 'no-access',
    user_role: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'SERVAT Portal',
    description: 'Portal corporativo del Grupo Servat',
    icon_url: '/icons/servat.svg',
    app_url: 'https://servat.com',
    roles_available: ['user', 'manager', 'admin'],
    is_active: true,
    access_status: 'granted',
    user_role: 'manager',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'DataFlow',
    description: 'Análisis de datos y reportes',
    icon_url: '/icons/dataflow.svg',
    app_url: 'https://dataflow.servat.com',
    roles_available: ['user', 'manager', 'admin'],
    is_active: true,
    access_status: 'granted',
    user_role: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export type MockAppStatus = 'granted' | 'pending' | 'denied' | 'no-access';