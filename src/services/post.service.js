import axios from "./axios.customize";

const createPostAPI = async (postData) => {
  try {
    const response = await axios.post("/v1/api/posts", postData);
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to create post");
  }
};

export { createPostAPI };
