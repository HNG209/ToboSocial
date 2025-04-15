import axios from "./axios.customize";

const getAllPosts = () => {
    return axios.get('/posts');
};

export {
    getAllPosts,
}