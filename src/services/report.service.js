import axios from "./axios.customize";

const reportPostAPI = (postId, userId, reason, description = '') => {
    return axios.post('/v1/api/reports', {
        reporter: userId,
        post: postId,
        reason,
        description
    });
};

export {
    reportPostAPI
};
