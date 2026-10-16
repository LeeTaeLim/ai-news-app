# DESIGN.md — AI 뉴스 수집기 UI 디자인 가이드

현재 메인 화면(뉴스 카드 목록)의 디자인을 정리한 문서다. 새 화면이나 컴포넌트를 만들 때 이 규칙을 따른다.
기준 구현은 `src/app/news-layout.tsx`, `src/app/news-card.tsx`이고, 로그인 없이 `http://localhost:3000/preview`(개발 모드 전용)에서 볼 수 있다.

## 1. 디자인 원칙

- **깔끔하고 읽기 편하게.** 장식보다 여백과 글자 위계로 구분한다. 그림자는 약하게, 테두리는 연하게.
- **파란색은 강조에만.** 바탕과 본문은 회색(slate) 계열이고, 파란색(blue)은 배지·링크·주요 버튼·로고처럼 눈이 가야 할 곳에만 쓴다.
- **한국어 가독성 우선.** 한글은 단어 단위로 줄바꿈(`break-keep`)하고, 본문 줄 간격을 넉넉히 둔다.
- **같은 정보는 같은 자리에.** 모든 카드는 정보 순서와 정렬이 같아야 한다. 데이터 길이에 따라 레이아웃이 달라지면 안 된다.

## 2. 색상

Tailwind 기본 팔레트를 그대로 쓴다. 별도 색상 토큰은 아직 없다.

| 용도 | 라이트 | 다크 |
|---|---|---|
| 페이지 배경 | `slate-50` | `slate-950` |
| 카드·헤더 배경 | `white` (헤더는 `white/90` + blur) | `slate-900` (헤더는 `slate-900/90`) |
| 테두리 | `slate-200`, 카드 안 구분선 `slate-100` | `slate-800` |
| 제목 텍스트 | `slate-900` | `slate-50` |
| 본문 텍스트 | `slate-600` | `slate-300` |
| 보조 텍스트 (출처·날짜·개수) | `slate-500` | `slate-400` |
| **주 색상** (주요 버튼, 로고) | `blue-600`, hover `blue-700` | 동일 |
| 링크 | `blue-600`, hover `blue-700` | `blue-400`, hover `blue-300` |
| 연한 강조 바탕 (배지, 저장됨) | `blue-50` + 글자 `blue-700` | `blue-950` + 글자 `blue-300` |
| 비강조 배지 (미분류) | `slate-100` + 글자 `slate-600` | `slate-800` + 글자 `slate-300` |

- 회색은 **slate만** 쓴다. `zinc`, `gray`, `neutral`을 섞지 않는다(파란색과 어울리는 푸른 회색 톤 유지).
- 오류 메시지가 필요하면 `red-600`/`red-50` 조합을 쓰고, 성공·완료 표시는 별도 초록색 대신 파란 계열(`blue-50`/`blue-700`)로 통일한다.

## 3. 타이포그래피

- 글꼴: Geist(영문·숫자) → 한글은 시스템 글꼴로 대체(`Apple SD Gothic Neo`, `Malgun Gothic`). `globals.css`의 `--font-sans`에 정의.
- 한국어 텍스트가 들어가는 제목·본문에는 `break-keep`을 붙인다.

| 요소 | 클래스 |
|---|---|
| 앱 이름 (헤더) | `text-lg font-bold` |
| 섹션 제목 ("최신 뉴스") | `text-xl font-bold` + 옆에 개수 `text-sm text-slate-500` |
| 카드 머리글 (출처·날짜) | `text-[13px]`, 출처명 `font-semibold`, 날짜 `tabular-nums` |
| 카드 제목 | `text-lg font-semibold leading-snug tracking-tight text-pretty` |
| 카드 본문 (요약) | `text-[15px] leading-7` |
| 카드 카테고리 배지 | `text-xs font-medium` |
| 메타 정보, 배지, 버튼, 링크 | `text-sm` (배지·버튼·링크는 `font-medium`) |

## 4. 레이아웃

- 콘텐츠 최대 너비 `max-w-6xl`, 가운데 정렬. 좌우 여백 `px-4`(모바일) / `sm:px-6`.
- 본문 영역 위아래 여백 `py-8`. 섹션 제목과 그리드 사이 `mb-6`.
- 카드 그리드: `grid gap-5`
  - 기본(~639px): 1열
  - `sm`(640px~): 2열
  - `xl`(1280px~): 3열
- 카드 높이는 행 안에서 가장 긴 카드에 맞춰 늘어나고, 하단 액션 영역은 `mt-auto`로 항상 카드 바닥에 붙는다.

## 5. 컴포넌트

### 헤더 (`NewsShell`)
- 화면 위에 고정(`sticky top-0`), 반투명 흰 배경 + `backdrop-blur`, 아래 테두리 `slate-200`.
- 왼쪽: 로고(파란 `size-7 rounded-lg` 사각형 안에 흰색 "AI") + 앱 이름. 오른쪽: 사용자 메뉴(Clerk `UserButton`).
- 이후 단계에서 카테고리 관리 링크, Notion 연결 상태를 오른쪽 사용자 메뉴 왼쪽에 추가한다.

### 뉴스 카드 (`NewsCard`)

```
┌───────────────────────────────┐
│ [TC] TechCrunch · 2026년 10월 14일 ✕ │
│ 한국어 제목 (최대 2~3줄)          │
│                                 │
│ 한국어 요약 3~4문장               │
│ ─────────────────────────────── │
│ [카테고리]     원문 보기 ↗ [뉴스 저장] │
└───────────────────────────────┘
```

- 컨테이너: `rounded-2xl border p-6 shadow-sm`, 흰 배경, `relative overflow-hidden`(hover 강조선용).
- 위계: **어디서·언제(머리글) → 무엇(제목) → 내용(요약) → 분류와 행동(하단)**. 눈이 위에서 아래로 한 번만 내려가게 한다.
- 정보 순서(고정): 출처·날짜 머리글 + 삭제 버튼 → 제목(`mt-3`) → 요약(`mt-3`) → 구분선 + 카테고리 배지·액션(`pt-4`).
- 출처 머리글: 모노그램(`TC`, `V` — `h-5 min-w-5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600`) + 출처명(`slate-700 font-semibold`) + 가운뎃점(`slate-300`) + 날짜(`slate-500`). 출처 표기는 `TechCrunch`, `The Verge`이고, 출처마다 다른 색을 쓰지 않는다.
- 날짜: 한국 시간(`Asia/Seoul`) 기준 `2026년 10월 14일` 형식, `<time dateTime>`으로 감싼다.
- hover와 키보드 포커스(`focus-within`)에 같은 반응을 준다. 200ms `ease-out`.
  - 카드가 살짝 떠오름(`-translate-y-0.5`), 그림자 `shadow-lg shadow-slate-900/[0.06]`, 테두리 `slate-300`(다크 `slate-700`).
  - 카드 위쪽의 `h-0.5 bg-blue-600` 강조선이 왼쪽에서 펼쳐진다(`scale-x-0` → `scale-x-100`, 300ms).
  - 삭제 버튼은 평소 `slate-300`으로 물러나 있다가 카드 hover 시 `slate-400`이 된다.
  - "원문 보기"의 `↗`가 링크 hover 시 오른쪽 위로 살짝 움직인다.
  - 움직임 줄이기 설정이면(`motion-reduce:`) 이동과 전환을 끈다.

### 카테고리 배지
- `rounded-full px-2.5 py-0.5 text-xs font-medium`, 카드 하단 왼쪽에 둔다. 이름이 길면 `truncate`로 자르고 `title`에 전체 이름을 넣는다.
- 카테고리 있음: 파란 배지(`blue-50` 바탕, `blue-700` 글자, `blue-100` 안쪽 테두리).
- 미분류(`categoryId = null`): 회색 배지(`slate-100` 바탕, `slate-600` 글자). 테두리 없음.
- 카테고리마다 다른 색을 주지 않는다. 사용자가 카테고리를 자유롭게 추가하므로 색을 하나로 통일한다.

### 버튼과 링크

| 종류 | 스타일 | 예 |
|---|---|---|
| 주 버튼 | `rounded-lg bg-blue-600 text-white hover:bg-blue-700`, 작게 `px-3 py-1.5` / 크게 `px-5 py-2.5` | 뉴스 저장, 뉴스 가져오기 |
| 보조 버튼 | `border border-blue-200 text-blue-700 hover:bg-blue-50` | 회원가입, 취소 |
| 상태 표시 버튼 | `bg-blue-50 text-blue-700 hover:bg-blue-100` | ✓ 저장됨 (Notion 페이지 링크) |
| 텍스트 링크 | `text-blue-600 hover:underline` + 외부 링크는 `↗` | 원문 보기 |
| 비활성 | `disabled:opacity-50 disabled:cursor-not-allowed` | 저장 중인 뉴스 저장 버튼 |

- 로그인 화면(`SignInGate`)의 버튼만 `rounded-full`이고, 앱 안의 버튼은 `rounded-lg`이다.
- 외부 링크는 모두 `target="_blank" rel="noopener noreferrer"`.

### 빈 상태
- 점선 테두리 박스: `rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center`.
- 첫 줄은 상황(`font-medium`), 둘째 줄은 다음 행동 안내(`text-sm text-slate-500`).

### 로딩 상태
- `slate-500` 텍스트("불러오는 중…")를 쓴다. 문구는 "~하는 중…"으로 통일.
- 뉴스 카드 목록을 처음 불러올 때는 문구 아래에 **스켈레톤 카드**(`NewsCardGridSkeleton`, 기본 6개)를 같은 그리드로 보여 준다.
  - 카드와 같은 박스(`rounded-2xl border p-6 shadow-sm`)에 `animate-pulse`(움직임 줄이기 설정이면 `motion-reduce:animate-none`으로 멈춤). 출처 머리글·제목·요약·하단 영역(배지, 링크, 버튼) 자리를 회색 막대(`slate-200` / 다크 `slate-800`)로 채운다.
  - 배지와 버튼 자리는 더 연하게 `slate-100`(다크 `slate-800`). 파란색은 쓰지 않는다.
  - 전체를 `role="status"`로 감싸고, 막대들은 `aria-hidden`이다.

## 6. 다크 모드

- 시스템 설정(`prefers-color-scheme`)을 따른다. 모든 색상 클래스에 `dark:` 짝을 함께 쓴다(2장 표 참고).

## 7. 문구 톤

- UI 문구는 한국어 존댓말 해요체: "아직 저장된 뉴스가 없어요.", "Notion 연결 후 사용할 수 있어요".
- 버튼은 짧은 명사형/동사형: "뉴스 가져오기", "뉴스 저장", "원문 보기".

## 8. 다음 단계 화면에 적용할 때

- **"뉴스 가져오기" 버튼**: 섹션 제목 줄 오른쪽에 큰 주 버튼으로 둔다. 진행 중에는 비활성 + "가져오는 중…", 끝나면 "새 뉴스 N개를 가져왔어요" 안내.
- **카테고리 필터 탭(F5)**: 섹션 제목 아래, 그리드 위. 선택된 탭은 `bg-blue-600 text-white`, 나머지는 `bg-white text-slate-600 border-slate-200` 알약 모양(`rounded-full`). 순서는 전체 → 카테고리들 → 미분류. 모바일에서는 가로 스크롤.
- **카테고리 관리 화면**: 같은 `NewsShell` 헤더와 `max-w-6xl` 폭을 쓰되, 목록은 카드와 같은 흰 박스 스타일. 삭제 확인처럼 위험한 동작의 버튼만 `red-600`.
- **오류 메시지**(RSS 실패, 저장 실패 등): 화면을 막지 말고 해당 영역 위에 `red-50` 바탕 안내 박스로 보여 준다.
