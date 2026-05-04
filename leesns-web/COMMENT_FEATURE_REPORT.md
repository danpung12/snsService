# 댓글 기능 프론트 연동 보고서

## 적용 범위

- `chapter07`의 댓글 UI 배치를 기준으로 `leesns-web`에 댓글 목록, 댓글 작성, 댓글 수정, 댓글 삭제 UI를 연결했습니다.
- 피드의 게시글 댓글 버튼은 예제처럼 게시글 상세 페이지로 이동하도록 구성했습니다.
- 게시글 상세 페이지는 예제와 같은 순서로 `PostItem`, 댓글 제목, `CommentEditor`, `CommentList`를 렌더링합니다.
- 현재 로그인한 사용자 id와 댓글의 `authorId` 또는 `author.id`를 비교해 본인 댓글에만 수정/삭제 버튼이 보이도록 했습니다.

## 백엔드 제약으로 제외한 부분

- 대댓글 UI와 동작은 제외했습니다. 현재 백엔드 `Comment` 모델에 `parentId` 같은 대댓글 구조가 없습니다.
- 댓글 페이지네이션은 제외했습니다. 현재 백엔드 댓글 조회 API가 전체 댓글 배열을 반환합니다.
- 실제 댓글 작성자 프로필 이미지는 표시하지 않습니다. 현재 백엔드 댓글 응답에 avatar URL이 없어서 기본 아바타를 사용합니다.

## 구현 파일

- 댓글 API: `src/service/comment.ts`
- 댓글 쿼리/뮤테이션 훅: `src/hooks/use-comments-data.ts`, `use-create-comment.ts`, `use-update-comment.ts`, `use-delete-comment.ts`
- 댓글 UI: `src/components/comment/comment-editor.tsx`, `comment-item.tsx`, `comment-list.tsx`
- 게시글 상세 페이지: `src/app/post/[postId]/page.tsx`
- 피드 댓글 이동 연결: `src/components/post/post-item.tsx`
