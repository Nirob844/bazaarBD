import { instance } from "../axios/axiosInstance";
import { getBaseUrl } from "../config/envConfig";
import { authKey } from "../constants/storageKey";
import { decodeToken } from "./jwt";
import {
  getFromLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from "./local-storage";

export const storeUserInfo = ({ accessToken }: { accessToken: string }) => {
  return setToLocalStorage(authKey, accessToken as string);
};

export const getUserInfo = () => {
  const authToken = getFromLocalStorage(authKey);
  if (authToken) {
    const decodeData = decodeToken(authToken);
    return decodeData;
  } else return "";
};

export const isLoggedIn = () => {
  const authToken = getFromLocalStorage(authKey);
  return !!authToken;
};

export const removeUserInfo = (key: string) => {
  return removeFromLocalStorage(key);
};

export const getNewAccessToken = async () => {
  return await instance({
    url: `${getBaseUrl()}/auth/refreshToken`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
};
