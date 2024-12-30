import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Dashboard
      "welcome": "Welcome back",
      "quickActions": "Quick Actions",
      "chat": "Chat",
      "search": "Search",
      "documents": "Documents",
      "settings": "Settings",
      "startConversation": "Start a conversation",
      "findInformation": "Find information",
      "viewResources": "View resources",
      "managePreferences": "Manage preferences",
      // Contact Directory
      "contactDirectory": "Contact Directory",
      "searchPlaceholder": "Search by name, role, or region...",
      "name": "Name",
      "role": "Role",
      "phone": "Phone",
      "email": "Email",
      "region": "Region",
      "committee": "Committee",
      "noResults": "No representatives found",
      "loadError": "Failed to load representatives. Please try again later."
    }
  },
  es: {
    translation: {
      // Dashboard
      "welcome": "Bienvenido de nuevo",
      "quickActions": "Acciones Rápidas",
      "chat": "Chat",
      "search": "Buscar",
      "documents": "Documentos",
      "settings": "Ajustes",
      "startConversation": "Iniciar una conversación",
      "findInformation": "Encontrar información",
      "viewResources": "Ver recursos",
      "managePreferences": "Administrar preferencias",
      // Contact Directory
      "contactDirectory": "Directorio de Contactos",
      "searchPlaceholder": "Buscar por nombre, rol o región...",
      "name": "Nombre",
      "role": "Rol",
      "phone": "Teléfono",
      "email": "Correo",
      "region": "Región",
      "committee": "Comité",
      "noResults": "No se encontraron representantes",
      "loadError": "Error al cargar los representantes. Por favor, inténtelo de nuevo más tarde."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;