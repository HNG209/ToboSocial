import axios from "./axios.customize";

// === DASHBOARD ===
export const fetchDashboardStatsAPI = (timeFilter = 'all') => {
    return axios.get('/v1/api/admin/dashboard', { params: { timeFilter } });
};

// === USERS ===
export const fetchAdminUsersAPI = (params = {}) => {
    return axios.get('/v1/api/admin/users', { params });
};

export const banUserAPI = (userId) => {
    return axios.patch(`/v1/api/admin/users/${userId}/ban`);
};

export const deleteUserAPI = (userId) => {
    return axios.delete(`/v1/api/admin/users/${userId}`);
};

// === POSTS ===
export const fetchAdminPostsAPI = (params = {}) => {
    return axios.get('/v1/api/admin/posts', { params });
};

export const deletePostByAdminAPI = (postId) => {
    return axios.delete(`/v1/api/admin/posts/${postId}`);
};

// === COMMENTS ===
export const fetchAdminCommentsAPI = (params = {}) => {
    return axios.get('/v1/api/admin/comments', { params });
};

export const deleteCommentByAdminAPI = (commentId) => {
    return axios.delete(`/v1/api/admin/comments/${commentId}`);
};

// === REPORTS ===
export const fetchReportsAPI = (params = {}) => {
    return axios.get('/v1/api/admin/reports', { params });
};

export const markReportReviewedAPI = (reportId) => {
    return axios.patch(`/v1/api/admin/reports/${reportId}/reviewed`);
};
