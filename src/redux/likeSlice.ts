import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface LikeState {
  likedPosts: { [postId: number]: boolean };
  likeCounts: { [postId: number]: number };
}

const initialState: LikeState = {
  likedPosts: {},
  likeCounts: {},
};

const likeSlice = createSlice({
  name: "likes",
  initialState,
  reducers: {
    setLikeData(
      state,
      action: PayloadAction<{ postId: number; liked: boolean; count: number }>
    ) {
      state.likedPosts[action.payload.postId] = action.payload.liked;
      state.likeCounts[action.payload.postId] = action.payload.count;
    },
    toggleLike(
      state,
      action: PayloadAction<{ postId: number; liked: boolean }>
    ) {
      const postId = action.payload.postId;
      state.likedPosts[postId] = action.payload.liked;

      if (state.likeCounts[postId] === undefined) {
        state.likeCounts[postId] = 0;
      }

      state.likeCounts[postId] += action.payload.liked ? 1 : -1;
    },
  },
});

export const { setLikeData, toggleLike } = likeSlice.actions;
export default likeSlice.reducer;
