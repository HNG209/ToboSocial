import axios from "./axios.customize";

// === DASHBOARD ===
export const fetchDashboardStatsAPI = (timeFilter = 'all') => {
    return axios.get('/v1/api/admin/dashboard', { params: { timeFilter } });
};

// === USERS ===
export const fetchAdminUsersAPI = (params = {}) => {
    return axios.get('/v1/api/admin/users', { params });
};

export const exportUsersAPI = (search, status) => {
    return axios.get('/v1/api/admin/users/export', { params: { search, status } });
};

export const banUserAPI = (userId) => {
    console.log(`Calling banUserAPI for user: ${userId}`);
    return axios.post(`/v1/api/ban/${userId}`);
};

export const unbanUserAPI = (userId) => {
    console.log(`Calling unbanUserAPI for user: ${userId}`);
    return axios.post(`/v1/api/unban/${userId}`);
};

export const deleteUserAPI = (userId) => {
    console.log(`Calling deleteUserAPI for user: ${userId}`);
    return axios.delete(`/v1/api/admin/users/${userId}`);
};

export const banMultipleUsersAPI = (userIds) => {
    console.log(`Calling banMultipleUsersAPI for users: ${userIds}`);
    return axios.patch('/v1/api/admin/users/ban-multiple', { userIds });
};

export const deleteMultipleUsersAPI = (userIds) => {
    console.log(`Calling deleteMultipleUsersAPI for users: ${userIds}`);
    return axios.delete('/v1/api/admin/users/delete-multiple', { data: { userIds } });
};

// === POSTS ===
export const fetchAdminPostsAPI = (params) => {
    console.log('Sending API params:', params);
    return axios.get('/v1/api/admin/posts', { params });
};

export const deletePostByAdminAPI = (postId) => {
    console.log(`Calling deletePostByAdminAPI for post: ${postId}`);
    return axios.delete(`/v1/api/admin/posts/${postId}`);
};

export const restorePostByAdminAPI = (postId) => {
    console.log(`Calling restorePostByAdminAPI for post: ${postId}`);
    return axios.patch(`/v1/api/admin/posts/${postId}/restore`);
};

// === COMMENTS ===
export const fetchAdminCommentsAPI = (params = {}) => {
    return axios.get('/v1/api/admin/comments', { params });
};

export const deleteCommentByAdminAPI = (commentId) => {
    console.log(`Calling deleteCommentByAdminAPI for comment: ${commentId}`);
    return axios.delete(`/v1/api/admin/comments/${commentId}`);
};

// === REPORTS ===
export const fetchReportsAPI = (params = {}) => {
    return axios.get('/v1/api/admin/reports', { params });
};

export const getPostReportCountAPI = (postId) => {
    return axios.get(`/v1/api/admin/reports/post/${postId}/count`);
};

export const markReportReviewedAPI = (reportId) => {
    console.log(`Calling markReportReviewedAPI for report: ${reportId}`);
    return axios.patch(`/v1/api/admin/reports/${reportId}/reviewed`);
};

export const warnUserAPI = (userId, message, relatedPostId = null) => {
    return axios.post(`/v1/api/users/${userId}/warn`, { message, relatedPostId });
};

export const getUserNotificationsAPI = (params = {}) => {
    return axios.get('/v1/api/notifications', { params });
};

export const markNotificationAsReadAPI = (notificationId) => {
    return axios.patch(`/v1/api/notifications/${notificationId}/read`);
};

export const markAllNotificationsAsReadAPI = () => {
    return axios.patch('/v1/api/notifications/read-all');
};