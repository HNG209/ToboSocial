import axios from "./axios.customize";

const refreshTokenAPI = async () => {
    const URL_BACKEND = `/v1/api/auth/refresh`;
    return axios.get(URL_BACKEND);
}

export { refreshTokenAPI };