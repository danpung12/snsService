import { Injectable, NotFoundException } from '@nestjs/common';

export interface PostModel {
  id: number;
  nickname: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let posts: PostModel[] = [
  {
    id: 1,
    nickname: 'newjeans_official',
    title: '뉴진스 민지',
    content: '메이크업 고치고 있는 민지',
    likeCount: 1000,
    commentCount: 999,
  },
  {
    id: 2,
    nickname: 'newjeans_official',
    title: '뉴진스 해린',
    content: '노래 연습하고 있는 해린',
    likeCount: 1000,
    commentCount: 999,
  },
  {
    id: 3,
    nickname: 'blackpink_official',
    title: '블랙핑크 로제',
    content: '먹방 하고 있는 로제',
    likeCount: 1000,
    commentCount: 999,
  },
];

@Injectable()
export class PostsService {
  getAllPosts() {
    return posts;
  }

  getPostbyId(id: number) {
    return posts.find((post) => post.id === +id);
  }

  createPost(nickname: string, title: string, content: string) {
    const post: PostModel = {
      id: posts[posts.length - 1].id + 1,
      nickname,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    };

    posts = [...posts, post];

    return post;
  }

  updatePost(id: number, title?: string, content?: string) {
    const post = this.getPostbyId(id);
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    if (title) post.title = title;
    if (content) post.content = content;
    return post;
  }

  deletePost(id: number) {
    const post = this.getPostbyId(id);
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    posts = posts.filter((p) => p.id !== id);
    return id;
  }
}
