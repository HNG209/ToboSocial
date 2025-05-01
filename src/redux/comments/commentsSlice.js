import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchPostCommentsAPI } from "../../services/api.service";

export const fetchPostComments = createAsyncThunk('posts/fetchPostComments', async (postId, { rejectWithValue }) => {
    try {
        const response = await fetchPostCommentsAPI(postId);
        return { postId, comments: response }; //payload
    } catch (error) {
        console.error('Error in fetchComments:', error.message);
        return rejectWithValue(error.message);
    }
});

//store the comments context of current selected post
const commentsSlice = createSlice({
    name: 'comments',
    initialState: {
        postId: null,
        comments: [],
        status: 'loading',
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPostComments.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPostComments.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.postId = action.payload.postId;
                state.comments = action.payload.comments;
            })
            .addCase(fetchPostComments.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
    }
})

export default commentsSlice.reducer;