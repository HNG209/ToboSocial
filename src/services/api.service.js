import axios from "./axios.customize";

// Post APIs
const fetchPostsAPI = (page, limit) => {
    const URL_BACKEND = `/v1/api/posts?page=${page}&limit=${limit}`;
    return axios.get(URL_BACKEND);
}

const likePostAPI = (postId, userId) => {
    const URL_BACKEND = `/v1/api/posts/${postId}/like`;
    return axios.post(URL_BACKEND, { userId });
}

const unlikePostAPI = (postId, userId) => {
    const URL_BACKEND = `/v1/api/posts/${postId}/unlike`;
    return axios.post(URL_BACKEND, { userId });
}

// Comment APIs
const fetchCommentsByPostAPI = (postId, page = 1, limit = 10) => { //?
    const URL_BACKEND = `/v1/api/comments?post=${postId}&page=${page}&limit=${limit}`;
    return axios.get(URL_BACKEND);
}

// Hung sua lai
const fetchPostCommentsAPI = (postId) => {
    const URL_BACKEND = `v1/api/posts/${postId}/comments`;
    return axios.get(URL_BACKEND);
}

const fetchPostCommentsAPIv2 = (postId, page = 1, limit = 10) => { //v2: có trả về trạng thái đã like bình luận của người dùng
    const URL_BACKEND = `v1/api/posts/${postId}/comments?page=${page}&limit=${limit}`;
    return axios.get(URL_BACKEND);
}

const fetchPostAuthorAPI = (postId) => {
    const URL_BACKEND = `v1/api/${postId}/author`;
    return axios.get(URL_BACKEND);
}

const createCommentAPI = (comment) => {
    const URL_BACKEND = `/v1/api/comments`;
    return axios.post(URL_BACKEND, comment);
}

const fetchRepliesByCommentAPI = ({ commentId, userId }, page = 1, limit = 2) => {
    const URL_BACKEND = `/v1/api/comments/${commentId}/replies?page=${page}&limit=${limit}`;
    return axios.post(URL_BACKEND, { userId });
}

const updateCommentAPI = (commentId, text) => {
    const URL_BACKEND = `/v1/api/comments/${commentId}`;
    return axios.patch(URL_BACKEND, { text });
}

const likeCommentAPI = (commentId, userId) => {
    const URL_BACKEND = `/v1/api/like-comment`;
    return axios.post(URL_BACKEND, { commentId, userId });
}

const unlikeCommentAPI = (commentId, userId) => {
    const URL_BACKEND = `/v1/api/unlike-comment`;
    return axios.post(URL_BACKEND, { commentId, userId });
}

const deleteCommentAPI = (commentId) => {
    const URL_BACKEND = `/v1/api/comments`;
    return axios.delete(URL_BACKEND, { data: { id: commentId } });
}

const fetchPostDetailAPI = (postId) => {
    const URL_BACKEND = `/v1/api/posts/${postId}`;
    return axios.get(URL_BACKEND);
}

const fetchPostByUserAPI = (authorId, page = 1, limit = 10) => {
    const URL_BACKEND = `/v1/api/users/${authorId}/posts?page=${page}&limit=${limit}`;
    return axios.get(URL_BACKEND);
}

const fetchPostByUserAPIV2 = (authorId, page = 1, limit = 10) => {
    const URL_BACKEND = `/v1/api/users/${authorId}/posts?page=${page}&limit=${limit}`;
    return axios.get(URL_BACKEND);
}

const fetchProfilePosts = (page = 1, limit = 10) => {
    const URL_BACKEND = `/v1/api/user/profile/posts?page=${page}&limit=${limit}`;
    return axios.get(URL_BACKEND);
}

//user api
const getUserAPI = (userId) => {
    const URL_BACKEND = `/v1/api/users/${userId}`;
    return axios.get(URL_BACKEND);
}

// v2 get user
const getUserAPIv2 = (userId) => {
    const URL_BACKEND = `/v1/api/users/${userId}`;
    return axios.get(URL_BACKEND);
}

const getUserProfile = () => { // nếu userId = null thì fallback về
    const URL_BACKEND = `/v1/api/user/profile`;
    return axios.get(URL_BACKEND);
}

//update user api
const updateUserAPI = (data) => {
    const URL_BACKEND = `/v1/api/users`;
    return axios.put(URL_BACKEND, data);
}

//like API v2
const likeAPIv2 = (postId, onModel) => {
    const URL_BACKEND = `/v1/api/like/${postId}`;
    return axios.post(URL_BACKEND, { onModel })
}

const unlikeAPIv2 = (postId, onModel) => {
    const URL_BACKEND = `/v1/api/unlike/${postId}`;
    return axios.post(URL_BACKEND, { onModel })
}

const likeStatusAPIv2 = (postId, onModel) => {
    const URL_BACKEND = `/v1/api/is-liked/${onModel}/${postId}`;
    return axios.get(URL_BACKEND)
}

const fetchLikersAPIv2 = (postId, onModel) => {
    const URL_BACKEND = `/v1/api/likers/${postId}`;
    return axios.post(URL_BACKEND, { onModel })
}

const counLikeAPIv2 = (postId, onModel) => {
    const URL_BACKEND = `/v1/api/like/count${postId}`;
    return axios.post(URL_BACKEND, { onModel })
}

//follow API
// Follow người dùng
const followUserAPI = (subjectId, followingId) => {
    const URL_BACKEND = `v1/api/follow`;
    return axios.post(URL_BACKEND, { subjectId, followingId });
};

// Unfollow người dùng
const unfollowUserAPI = (subjectId, followingId) => {
    const URL_BACKEND = `v1/api/unfollow`;
    return axios.post(URL_BACKEND, { subjectId, followingId });
};

// Lấy danh sách người đang được user follow
const getFollowingUsersAPI = (userId) => {
    const URL_BACKEND = `v1/api/${userId}/following`;
    return axios.get(URL_BACKEND);
};

// Lấy danh sách người đang follow user
const getFollowersAPI = (userId) => {
    const URL_BACKEND = `v1/api/${userId}/followers`;
    return axios.get(URL_BACKEND);
};

// Kiểm tra đã follow hay chưa
const isFollowingAPI = (subjectId, followingId) => {
    const URL_BACKEND = `v1/api/is-following?subjectId=${subjectId}&followingId=${followingId}`;
    return axios.get(URL_BACKEND);
};



const createPostAPI = async (postData) => {
    try {
        const response = await axios.post('/v1/api/posts', postData);
        return response;
    } catch (error) {
        throw new Error(error.message || 'Failed to create post');
    }
};

export {
    fetchPostsAPI,
    likePostAPI,
    unlikePostAPI,
    fetchCommentsByPostAPI,
    fetchPostCommentsAPI,
    fetchPostCommentsAPIv2,
    createCommentAPI,
    fetchRepliesByCommentAPI,
    deleteCommentAPI,
    updateCommentAPI,
    likeCommentAPI,
    unlikeCommentAPI,
    fetchPostDetailAPI,
    fetchPostByUserAPI,
    fetchPostByUserAPIV2,
    fetchProfilePosts,
    getUserAPI,
    getUserAPIv2,
    getUserProfile,
    updateUserAPI,
    fetchPostAuthorAPI,
    likeAPIv2,
    unlikeAPIv2,
    likeStatusAPIv2,
    fetchLikersAPIv2,
    counLikeAPIv2,
    createPostAPI,
    followUserAPI,
    unfollowUserAPI,
    getFollowingUsersAPI,
    getFollowersAPI,
    isFollowingAPI
};
