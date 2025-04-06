import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { setUser } from "../redux/slice/authSlice";
import { store } from "../redux/store";
import { getNewAccessToken } from "../utils/auth";
import { decodeToken } from "../utils/jwt";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  sent?: boolean; // to prevent infinite retry loop
}

interface ErrorResponse {
  statusCode: number;
  message: string;
  errorMessages?: string[] | string;
}

const instance: AxiosInstance = axios.create({
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

// Request Interceptor
instance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.auth.token;

    if (accessToken) {
      config.headers.set("Authorization", accessToken);
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    response.data = {
      data: response?.data?.data,
      meta: response?.data?.meta,
    };
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as CustomAxiosRequestConfig;

    if (error?.response?.status === 500 && !config?.sent) {
      config.sent = true;

      try {
        const res = await getNewAccessToken();
        const accessToken = res?.data?.accessToken;
        const user = decodeToken(accessToken);

        store.dispatch(setUser({ user, token: accessToken }));

        config.headers = {
          ...config.headers,
          Authorization: accessToken,
        };

        return instance(config);
      } catch {
        return Promise.reject({
          statusCode: 401,
          message: "Token refresh failed",
          errorMessages: ["Session expired. Please login again."],
        } as ErrorResponse);
      }
    }

    return Promise.reject({
      statusCode: error?.response?.status || 500,
      message:
        (error?.response?.data as { message?: string })?.message ||
        "Something went wrong!!!",
      errorMessages: (error?.response?.data as { message?: string })?.message,
    } as ErrorResponse);
  }
);

export { instance };
