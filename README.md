# AI 뉴스 수집기

버튼 한 번으로 해외 AI 뉴스를 모아 한국어로 읽는 웹 앱입니다. TechCrunch AI와 The Verge AI의 RSS 피드에서 기사를 가져오면 Claude가 제목을 번역하고, 3~4문장으로 요약하고, 카테고리를 붙입니다. 중요한 기사는 Notion 데이터베이스에 저장할 수 있습니다.

자세한 기획은 [`PRD.md`](PRD.md), 화면 디자인은 [`DESIGN.md`](DESIGN.md)와 [`ui.md`](ui.md)에 있습니다.

## 주요 기능

- **로그인**: Clerk로 회원가입과 로그인을 처리합니다. 사용자마다 자기 뉴스와 카테고리만 볼 수 있습니다.
- **뉴스 가져오기**: 버튼을 누르면 두 RSS 피드에서 최근 24시간 동안 올라온 기사를 가져옵니다. 자동으로 수집하지는 않습니다. 이미 저장한 기사는 다시 처리하지 않습니다.
- **번역·요약·분류**: 새 기사마다 Claude를 한 번 호출해 한국어 제목, 요약, 카테고리를 만듭니다. 맞는 카테고리가 없거나 호출이 실패하면 "미분류"로 저장합니다.
- **뉴스 카드 목록**: 최신순 카드 목록을 전체, 카테고리별, 미분류 탭으로 걸러 봅니다. 한 페이지에 9개씩 보여 줍니다.
- **Notion 저장**: 카드의 "뉴스 저장" 버튼을 누르면 Notion 데이터베이스에 페이지가 만들어지고, 버튼이 Notion 페이지로 가는 "저장됨"으로 바뀝니다.

아직 만들지 않은 기능: 카테고리 관리 화면, 첫 로그인 때 기본 카테고리 자동 생성, 사용자별 Notion OAuth 연결.

## 기술 스택

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4
- Clerk: 인증
- Neon (PostgreSQL) + Drizzle ORM: 데이터베이스
- Anthropic Claude API: 번역, 요약, 분류
- rss-parser: RSS 수집
- Notion API: 뉴스 저장

## 시작하기

### 1. 패키지 설치

```bash
npm install
```

`drizzle-kit` 명령이 실패하면 `npm install-scripts approve esbuild`를 실행하세요.

### 2. 환경 변수

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 채웁니다. 이 파일은 git에 올라가지 않습니다.

```bash
# Clerk (https://dashboard.clerk.com → API Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Neon (https://console.neon.tech → Connection string)
DATABASE_URL=

# Claude API (https://console.anthropic.com → API Keys)
ANTHROPIC_API_KEY=

# Notion 내부 통합 토큰과 저장할 데이터베이스 ID
NOTION_API_TOKEN=
NOTION_DATABASE_ID=
```

Notion 데이터베이스에는 다음 속성이 있어야 하고, 통합(integration)에 해당 데이터베이스를 공유해야 합니다.

| 속성 | 유형 | 저장하는 값 |
|---|---|---|
| 제목 | 제목 | 한국어 제목 |
| 요약 | 텍스트 | 한국어 요약 |
| 카테고리 | 선택 | 카테고리 이름 (없으면 "미분류") |
| 출처 | URL | 기사 원문 링크 |
| 날짜 | 날짜 | 기사 게시일 |

### 3. 데이터베이스 준비

```bash
npm run db:migrate
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 을 엽니다. 로그인하면 `/dashboard`에서 뉴스를 가져올 수 있습니다. 로그인 없이 카드 디자인만 보려면 개발 모드에서 `/preview`를 엽니다.

## 명령어

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 (Turbopack) |
| `npm run build` | 프로덕션 빌드 (타입 검사 포함) |
| `npm run start` | 빌드한 앱 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run db:generate` | 스키마 변경으로 마이그레이션 파일 생성 |
| `npm run db:migrate` | 마이그레이션 적용 |
| `npm run db:push` | 스키마를 DB에 바로 반영 |
| `npm run db:studio` | Drizzle Studio 열기 |

모든 명령은 `node --use-system-ca`로 실행합니다. 회사 네트워크처럼 HTTPS를 자체 인증서로 다시 서명하는 환경에서도 Node가 Windows에 등록된 인증서를 믿게 하기 위해서입니다.

## 폴더 구조

```
src/
├─ app/
│  ├─ page.tsx                # 첫 화면 (로그인 안내, 뉴스 목록)
│  ├─ dashboard/              # 대시보드: 뉴스 가져오기, 카테고리 탭, 페이지 나누기
│  │  └─ actions.ts           # 서버 액션: fetchNews, saveToNotion
│  ├─ news-card.tsx           # 뉴스 카드
│  ├─ notion-save-button.tsx  # "뉴스 저장" / "저장됨" 버튼
│  └─ preview/                # 개발용 디자인 미리보기
├─ db/
│  └─ schema.ts               # categories, articles, notion_connections 테이블
├─ lib/
│  ├─ rss.ts                  # RSS 피드 수집
│  ├─ translate.ts            # Claude 번역·요약·분류
│  ├─ articles.ts             # 기사 조회와 저장
│  ├─ categories.ts           # 카테고리 조회
│  ├─ notion.ts               # Notion 페이지 생성
│  └─ auth.ts                 # 로그인 확인 (requireUserId)
└─ proxy.ts                   # Clerk 미들웨어
drizzle/                      # 마이그레이션 SQL
```

## 사용한 플러그인

- **Frontend Design**: UI 디자인 품질 향상
- **commit-commands**: 깃 워크플로 자동화
