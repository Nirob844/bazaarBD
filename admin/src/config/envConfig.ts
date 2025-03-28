const backendLink = import.meta.env.VITE_BACKEND_LINK;
export const getBaseUrl = () => {
  return backendLink;
};
