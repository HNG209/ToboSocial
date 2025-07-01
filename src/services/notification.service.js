import axios from "./axios.customize";

const markAsReadAPI = async (notificationId) => {
    const URL_BACKEND = `/v1/api/notification/${notificationId}/isRead`;
    return axios.patch(URL_BACKEND);
};

const fetchMoreNotificationsAPI = async (page) => {
    const URL_BACKEND = `/v1/api/user/notifications?page=${page}&limit=10`;
    return axios.get(URL_BACKEND);
}

export {
    markAsReadAPI, fetchMoreNotificationsAPI
}