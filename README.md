<p align="center">
  <img src="./leesns-web\src\assets\logo.png" width="180" alt="LeeSNS Logo" />
</p>

# LeeSNS

## 1. 프로젝트 소개 📝

LeeSNS는 비로그인 우선형 공개 SNS 입니다.

사용자는 이미지 업로드, 댓글, 좋아요, 팔로우, DM, 실시간 알림 기능을 사용할 수 있습니다.

단순 CRUD를 넘어서 실제 SNS에서 필요한<br>
인증 유지, 이미지 업로드 안정성, 실시간 이벤트 전달, 조회수 통계 같은 문제를 직접 다뤘습니다.

특히 프론트엔드와 백엔드가 분리된 배포 환경에서도 인증이 유지되도록 JWT를 HttpOnly Cookie로 관리하고,<br>
이미지 파일은 Cloudflare R2 Presigned URL을 통해 클라이언트에서 직접 업로드하도록 구현했습니다.

### 개발 기간 📅

- **2026.03 ~ 2026.05**

### 개발 범위 🧑‍💻

- **백엔드**
  - 인증, 게시글, 댓글, 좋아요, 팔로우, 알림, DM, 이미지 업로드, 조회수 통계 등 모든 기능을 직접 구현했습니다.

- **프론트엔드**
  - 초기 컴포넌트 레이아웃 구현과 Zustand, TanStack Query 기반의 상태 관리 구조를 직접 구성했습니다.
  - 이후 백엔드 기능이 확장되면서 필요한 추가 페이지 구현, API 연결, 상태 관리 로직 보완, UI 수정 작업에는<br>
    AI 도구를 적극적으로 활용했습니다.
  - 생성된 코드는 직접 검토하고, 백엔드 응답 구조와 프로젝트 흐름에 맞게 수정해 서비스에 통합했습니다.

---

## 2. 시작 가이드 🚀

### 배포 주소 🌐

| 구분                 | 주소                                     |
| -------------------- | ---------------------------------------- |
| 🖥️ 웹 배포 주소      | https://snsservice.vercel.app            |
| ⚙️ 백엔드 배포 주소  | https://snsservice.onrender.com          |
| 📚 Swagger 문서 주소 | https://snsservice.onrender.com/api-docs |

### 설치 및 실행 방법 🛠️

```bash
# Repository clone
git clone https://github.com/Voluntain-SKKU/Voluntain-2nd.git
cd Voluntain-2nd
```

#### Backend 실행 ⚙️

```bash
cd leesns-backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

Backend는 기본적으로 `http://localhost:4000`에서 실행됩니다.

#### Frontend 실행 🖥️

```bash
cd leesns-web
npm install
npm run dev
```

Frontend는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## 3. 기술 스택 🐪

### Environment 🧰

[![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)](https://code.visualstudio.com/)
[![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)](https://git-scm.com/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Voluntain-SKKU/Voluntain-2nd)

### Config ⚙️

[![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/)

### Backend 🗄️

[![NestJS](https://img.shields.io/badge/NestJS%2011-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma%20ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Passport](https://img.shields.io/badge/Passport-34E27A?style=for-the-badge&logo=passport&logoColor=black)](https://www.passportjs.org/)
[![HttpOnly Cookie](https://img.shields.io/badge/HttpOnly%20Cookie-FFB000?style=for-the-badge&logo=cookiecutter&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Redis](https://img.shields.io/badge/Redis-FF4438?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Nodemailer](https://img.shields.io/badge/Nodemailer-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodemailer.com/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare%20R2-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://www.cloudflare.com/developer-platform/products/r2/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)
[![Nest Schedule](https://img.shields.io/badge/Nest%20Schedule-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://docs.nestjs.com/techniques/task-scheduling)

### Frontend 🖥️

[![Next.js](https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logoColor=white)](https://zustand-demo.pmnd.rs/)
[![Socket.IO Client](https://img.shields.io/badge/Socket.IO%20Client-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![Radix UI](https://img.shields.io/badge/Radix%20UI-161618?style=for-the-badge&logo=radixui&logoColor=white)](https://www.radix-ui.com/)
[![lucide-react](https://img.shields.io/badge/lucide--react-F56565?style=for-the-badge&logo=lucide&logoColor=white)](https://lucide.dev/)

### Communication 💬

[![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white)](https://www.notion.so/)

---

## 4. 주요 기능 ✨

### 🔐 인증 / 사용자

| 기능                    | 설명                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------- |
| 📧 이메일 인증 회원가입 | 이메일 인증 코드를 기반으로 회원가입을 진행합니다.                                    |
| 🍪 HttpOnly Cookie 인증 | 로그인 성공 시 Access Token과 Refresh Token을 HttpOnly Cookie로 발급합니다.           |
| 🟢 Google OAuth         | Google OAuth 로그인 흐름을 추가했습니다.                                              |
| 👤 프로필 관리          | 내 프로필 조회, 다른 사용자 프로필 조회, 닉네임/프로필 이미지 수정 기능을 제공합니다. |

### 📝 게시글 / 이미지

| 기능                 | 설명                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| 🧾 게시글 CRUD       | 게시글 작성, 조회, 수정, 삭제 기능을 구현했습니다.                                              |
| 📜 커서 페이지네이션 | 게시글 목록을 커서 기반 페이지네이션으로 조회합니다.                                            |
| 👥 팔로잉 피드       | 팔로우한 사용자 게시글만 모아볼 수 있는 피드를 제공합니다.                                      |
| 🖼️ 다중 이미지       | 게시글에 여러 이미지를 순서대로 연결할 수 있도록 `PostImage` 모델을 분리했습니다.               |
| ☁️ R2 Presigned URL  | Cloudflare R2 Presigned URL을 발급해 클라이언트가 이미지 파일을 직접 업로드하도록 구현했습니다. |
| 📊 조회수 차트       | 최근 7일 조회수 통계를 조회하고 프론트엔드에서 차트로 시각화했습니다.                           |

### 💬 댓글 / 좋아요 / 팔로우

| 기능                | 설명                                                                  |
| ------------------- | --------------------------------------------------------------------- |
| 💭 댓글 CRUD        | 게시글 댓글 작성, 조회, 수정, 삭제 기능을 구현했습니다.               |
| ❤️ 좋아요 토글      | 게시글 좋아요/좋아요 취소를 하나의 토글 API로 처리합니다.             |
| 🤝 팔로우 관리      | 사용자 팔로우/언팔로우와 팔로워/팔로잉 목록 조회 기능을 구현했습니다. |

### 🔔 알림

| 기능                | 설명                                                                          |
| ------------------- | ----------------------------------------------------------------------------- |
| ⚡ 이벤트 알림 생성 | 좋아요, 댓글, DM 이벤트가 발생하면 알림 데이터를 생성합니다.                  |
| 📡 실시간 알림      | Socket.IO namespace를 분리해 실시간 알림을 전달합니다.                        |
| ✅ 읽음 처리        | 읽지 않은 알림 개수 조회, 단일 알림 읽음 처리, 전체 읽음 처리를 구현했습니다. |

### 💌 DM / 실시간 채팅

| 기능                | 설명                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------- |
| 🔌 Socket.IO DM     | Socket.IO 기반 DM 기능을 구현했습니다.                                                       |
| 📨 메시지 송수신    | 메시지 송수신, 채팅방 목록 조회, 메시지 페이지네이션을 구현했습니다.                         |
| 🕒 채팅방 정렬      | 마지막 메시지와 마지막 메시지 시간을 저장해 채팅방 목록 정렬에 활용했습니다.                 |
| 🔕 조건부 DM 알림   | 상대방이 현재 채팅방을 보고 있지 않을 때만 메시지 알림을 생성하도록 처리했습니다.            |

---

## 5. API 문서 📚

Swagger 문서는 아래 주소에서 확인할 수 있습니다.

- 🧪 Local: http://localhost:4000/api-docs
- 🚀 Deploy: https://snsservice.onrender.com/api-docs

주요 API는 다음과 같습니다.

| Domain        | Method | Endpoint                                 | Description                     |
| ------------- | ------ | ---------------------------------------- | ------------------------------- |
| Auth          | POST   | `/auth/signup`                           | 회원가입                        |
| Auth          | POST   | `/auth/login`                            | 로그인 및 인증 쿠키 발급        |
| Auth          | POST   | `/auth/logout`                           | 로그아웃 및 인증 쿠키 제거      |
| Auth          | POST   | `/auth/token/access`                     | Access Token 재발급             |
| Auth          | POST   | `/auth/email/code`                       | 이메일 인증 코드 발송           |
| Auth          | POST   | `/auth/email/verify`                     | 이메일 인증 코드 확인           |
| Auth          | GET    | `/auth/google`                           | Google OAuth 로그인 시작        |
| Users         | GET    | `/users/me`                              | 내 프로필 조회                  |
| Users         | PATCH  | `/users/me`                              | 내 프로필 수정                  |
| Users         | GET    | `/users/:userId`                         | 사용자 프로필 조회              |
| Posts         | GET    | `/posts`                                 | 게시글 목록 조회                |
| Posts         | POST   | `/posts/following`                       | 팔로잉 피드 조회                |
| Posts         | GET    | `/posts/:id`                             | 게시글 상세 조회 및 조회수 증가 |
| Posts         | POST   | `/posts`                                 | 게시글 작성                     |
| Posts         | PATCH  | `/posts/:id`                             | 게시글 수정                     |
| Posts         | DELETE | `/posts/:id`                             | 게시글 삭제                     |
| Posts         | POST   | `/posts/:postId/like`                    | 좋아요/좋아요 취소              |
| Comments      | GET    | `/posts/:postId/comments`                | 댓글 목록 조회                  |
| Comments      | POST   | `/posts/:postId/comments`                | 댓글 작성                       |
| Comments      | PATCH  | `/posts/:postId/comments/:id`            | 댓글 수정                       |
| Comments      | DELETE | `/posts/:postId/comments/:id`            | 댓글 삭제                       |
| Uploads       | POST   | `/uploads/presigned-url`                 | R2 Presigned URL 발급           |
| Uploads       | POST   | `/uploads/profile-image`                 | 프로필 이미지 업로드            |
| Follows       | POST   | `/follows/:userId`                       | 팔로우                          |
| Follows       | DELETE | `/follows/:userId`                       | 언팔로우                        |
| Notifications | GET    | `/notifications`                         | 알림 목록 조회                  |
| Notifications | GET    | `/notifications/unread-count`            | 읽지 않은 알림 개수 조회        |
| Notifications | PATCH  | `/notifications/:id/read`                | 알림 읽음 처리                  |
| Notifications | PATCH  | `/notifications/read-all`                | 모든 알림 읽음 처리             |
| Stats         | GET    | `/stats/posts/:postId/views/last-7-days` | 최근 7일 게시글 조회수 통계     |

### Socket.IO Events 🔌

| Namespace        | Event                  | Description                          |
| ---------------- | ---------------------- | ------------------------------------ |
| `/notifications` | `joinNotificationRoom` | 사용자 알림 room 참여                |
| `/notifications` | `newNotification`      | 실시간 알림 수신                     |
| `/chats`         | `createChat`           | DM 채팅방 생성 또는 기존 채팅방 조회 |
| `/chats`         | `sendMessage`          | 메시지 전송                          |
| `/chats`         | `receiveMessage`       | 메시지 수신                          |
| `/chats`         | `getMyChatRooms`       | 내 채팅방 목록 조회                  |
| `/chats`         | `getMessages`          | 채팅 메시지 조회                     |
| `/chats`         | `enterViewingRoom`     | 현재 보고 있는 채팅방 등록           |
| `/chats`         | `leaveViewingRoom`     | 현재 보고 있는 채팅방 해제           |

---

## 6. 프로젝트 구조 🗂️

```txt
snsService
├─ leesns-backend
│  ├─ prisma
│  │  ├─ migrations
│  │  ├─ schema.prisma
│  │  └─ prisma.service.ts
│  └─ src
│     ├─ auth
│     ├─ chats
│     ├─ comments
│     ├─ follows
│     ├─ mail
│     ├─ notifications
│     ├─ posts
│     ├─ redis
│     ├─ stats
│     ├─ uploads
│     └─ users
└─ leesns-web
   └─ src
      ├─ app
      ├─ assets
      ├─ components
      ├─ hooks
      ├─ lib
      ├─ service
      ├─ store
      └─ types
```

---

## 7. 트러블슈팅

### 1. 로컬에서는 잘 작동하던 쿠키 인증이 배포 환경에서는 실패하던 문제 📱

- https://velog.io/@aass6863/웹-배포-트러블슈팅

### 2. 로컬 서버 저장 방식 이미지 업로드의 한계 🖼️

- 서버 로컬 폴더에 이미지를 저장하면 서버 재시작이나 배포 환경에서 파일이 사라질 수 있었다.
- 이를 해결하기 위해 Cloudflare R2와 Presigned URL 방식을 사용했다.
- 백엔드는 업로드 URL만 발급하고, 클라이언트가 해당 URL로 직접 파일을 업로드하도록 분리했다.
- 서버 부하를 줄이고 배포 환경에서도 이미지가 안정적으로 유지되도록 개선했다.

### 3. JWT sub 와 Prisma User.id 불일치로 인한 커스텀 데코레이터 인식 오류

- https://velog.io/@aass6863/트러블슈팅-JWT-sub-클레임과-Prisma-User.id-불일치로-인한-커스텀-데코레이터-인식-오류

---

## 8. 배운 점 🧠

### 1. 실시간 알림 구현 🔔

- https://velog.io/@aass6863/NestJS-알림-기능-구현하기-초급
- https://velog.io/@aass6863/NestJS-DM-알림-차단-구현하기-채팅방-입장-감지

### 2. DM 기능 구현 💬

- https://velog.io/@aass6863/NestJS-DM-기능-초급

### 3. 유저 기능 👤

- https://velog.io/@aass6863/NestJS-프로필-이미지-구현
- https://velog.io/@aass6863/NestJS-마이페이지-만들기
- https://velog.io/@aass6863/NestJS-팔로우-기능-Follows

### 4. 게시글 기능 📝

- https://velog.io/@aass6863/NestJS-좋아요-기능-like
- https://velog.io/@aass6863/NestJS-파일-업로드

### 5. 인증 기능 🔐

- https://velog.io/@aass6863/Nest-passport-간편로그인
- https://velog.io/@aass6863/Guard-가드
- https://velog.io/@aass6863/NestJS-이메일-인증-구현-Redis
- https://velog.io/@aass6863/Nest-Dto-ClassValidator

### 6. 게시글 통계 기능 📊

- 게시글 상세 조회 시 조회수를 증가시키고, 통계용 테이블에는 일자별 조회수 스냅샷을 저장하도록 분리했다.
- 스케줄러를 사용해 게시글별 조회수 스냅샷을 주기적으로 저장한다.
- 최근 7일 조회수 통계를 조회할 수 있도록 API를 구현하고, 프론트엔드에서는 차트로 시각화했다.
