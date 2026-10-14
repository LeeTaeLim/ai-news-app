# AI 뉴스 수집기 UI 가이드

AI 뉴스 수집기의 화면을 만들 때 따르는 규칙입니다.
메인 화면은 뉴스를 카드로 보여 주는 **대시보드**입니다.

> **함께 볼 문서**
> - `DESIGN.md`: 색상, 글꼴 같은 시각 규칙의 원본입니다. 이 문서와 다르면 `DESIGN.md`를 따릅니다.
> - 기준 코드: `src/app/news-layout.tsx`, `src/app/news-card.tsx`
> - 미리보기: `http://localhost:3000/preview` (개발 모드, 로그인 불필요)

---

## 1. 기본 원칙

1. **깔끔하게.** 장식 대신 여백과 글자 크기로 구분합니다.
2. **색은 최소한으로.** 회색은 `slate`, 강조는 `blue`, 오류와 삭제만 `red`를 씁니다.
3. **한글은 읽기 편하게.** 한글 제목과 본문에는 `break-keep`을 붙입니다.
4. **어디서나 같은 모양.** 같은 종류의 요소는 모든 화면에서 같은 클래스를 씁니다.

스타일링은 **Tailwind CSS v4**만 씁니다. 설정은 `src/app/globals.css`에 있고, `tailwind.config`나 별도 CSS 파일은 만들지 않습니다.

---

## 2. 기본 값

### 색상

| 용도 | 라이트 | 다크 |
|---|---|---|
| 페이지 배경 | `bg-slate-50` | `dark:bg-slate-950` |
| 카드, 헤더 | `bg-white` | `dark:bg-slate-900` |
| 테두리 | `border-slate-200` | `dark:border-slate-800` |
| 제목 | `text-slate-900` | `dark:text-slate-50` |
| 본문 | `text-slate-600` | `dark:text-slate-300` |
| 보조 텍스트 | `text-slate-500` | `dark:text-slate-400` |
| 강조 (버튼, 링크) | `blue-600` | 버튼 동일, 링크 `dark:text-blue-400` |
| 연한 강조 (배지, 안내) | `bg-blue-50 text-blue-700` | `dark:bg-blue-950 dark:text-blue-300` |

다크 모드는 시스템 설정을 따릅니다. **색상 클래스를 쓸 때는 위 표의 `dark:` 짝을 항상 같이 씁니다.** 아래 예시 코드는 읽기 쉽도록 `dark:` 클래스를 생략했습니다.

### 모서리

| 요소 | 클래스 |
|---|---|
| 카드, 박스 | `rounded-2xl` |
| 버튼 | `rounded-lg` |
| 탭, 배지 | `rounded-full` |

### 글자

| 요소 | 클래스 |
|---|---|
| 앱 이름 | `text-lg font-bold` |
| 섹션 제목 | `text-xl font-bold` |
| 카드 제목 | `text-lg font-semibold leading-snug` |
| 카드 요약 | `text-[15px] leading-7` |
| 메타 정보, 버튼, 탭 | `text-sm` (버튼과 탭은 `font-medium`) |

### 문구

- 해요체로 씁니다. 예: "아직 저장된 뉴스가 없어요."
- 버튼은 짧게 씁니다. 예: "뉴스 가져오기", "원문 보기"
- 진행 중 표시는 "~하는 중…"으로 통일합니다.

---

## 3. 대시보드 화면

```
┌──────────────────────────────────────────────────────┐
│ [AI] AI 뉴스 수집기       카테고리 관리  Notion ●  (👤) │  헤더
├──────────────────────────────────────────────────────┤
│                                                      │
│ 최신 뉴스 24개                      [ 뉴스 가져오기 ]   │  섹션 제목
│                                                      │
│ (전체) (AI 모델/연구) (제품/서비스) … (미분류) (+ 추가)  │  카테고리 바
│                                                      │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│ │ 뉴스 카드 │  │ 뉴스 카드 │  │ 뉴스 카드 │             │  카드 그리드
│ └──────────┘  └──────────┘  └──────────┘             │
└──────────────────────────────────────────────────────┘
```

순서는 항상 **헤더 → 섹션 제목 → 카테고리 바 → 카드 그리드**입니다.

```tsx
<div className="flex flex-1 flex-col bg-slate-50">
  <header>…</header>
  <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
    …
  </main>
</div>
```

콘텐츠 폭은 `max-w-6xl`, 좌우 여백은 `px-4 sm:px-6`입니다. 헤더 안쪽도 같습니다.

---

## 4. 헤더

```tsx
<header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
  <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
    <h1 className="flex items-center gap-2 text-lg font-bold text-slate-900">
      <span className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
        AI
      </span>
      AI 뉴스 수집기
    </h1>
    <div className="flex items-center gap-4">…</div>
  </div>
</header>
```

- **왼쪽:** 로고와 앱 이름 "AI 뉴스 수집기"
- **오른쪽:** 카테고리 관리 → Notion 연결 상태 → 사용자 메뉴(`UserButton`)
- Notion 상태는 작은 점(`size-2 rounded-full`)으로 보여 줍니다. 연결되면 파란 점, 아니면 회색 점입니다.
- 모바일에서는 링크 글자를 숨기고(`hidden sm:inline`) 점과 아이콘만 남깁니다.

---

## 5. 섹션 제목

```tsx
<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
  <div className="flex items-baseline gap-2">
    <h2 className="text-xl font-bold text-slate-900">최신 뉴스</h2>
    <span className="text-sm text-slate-500">24개</span>
  </div>
  <button className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
    뉴스 가져오기
  </button>
</div>
```

- 개수는 지금 선택된 카테고리의 카드 수입니다.
- 가져오는 동안은 버튼을 비활성화하고 "가져오는 중…"으로 바꿉니다.

---

## 6. 카테고리 바

카드 목록 바로 위에 카테고리를 탭으로 나열하고, **맨 끝에 추가 버튼**을 둡니다.

```
(전체)  (AI 모델/연구)  (제품/서비스)  …  (미분류)  ( + 카테고리 추가 )
 선택됨                                              점선 테두리
```

### 순서

1. **전체**: 맨 앞. 처음 들어오면 선택돼 있습니다.
2. **내 카테고리**: 만든 순서대로 나열합니다.
3. **미분류**: 카테고리가 없는 기사입니다. 항상 표시합니다.
4. **+ 카테고리 추가**: 맨 끝. 탭이 아니라 버튼입니다.

### 스타일

세 가지 모양만 있습니다. 공통으로 `rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap`을 씁니다.

| 모양 | 추가 클래스 |
|---|---|
| 기본 탭 | `border border-slate-200 bg-white text-slate-600 hover:text-blue-700` |
| 선택된 탭 | `border border-blue-600 bg-blue-600 text-white` |
| 추가 버튼 | `border border-dashed border-blue-300 text-blue-700 hover:bg-blue-50` |

```tsx
<nav aria-label="카테고리" className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
  <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
    <li><button aria-pressed={true}>전체</button></li>
    …
    <li><Link href="/categories?new=1">+ 카테고리 추가</Link></li>
  </ul>
</nav>
```

### 규칙

- 모든 카테고리 탭은 **같은 색**입니다. 카테고리마다 색을 다르게 주지 않습니다.
- 선택 상태는 `aria-pressed`로도 표시합니다.
- 모바일은 한 줄 가로 스크롤, `sm` 이상은 여러 줄로 감깁니다.
- 추가 버튼을 누르면 카테고리 관리 화면의 추가 폼으로 갑니다.
- 선택한 카테고리에 뉴스가 없으면 "이 카테고리에 해당하는 뉴스가 없어요."를 보여 줍니다.

---

## 7. 뉴스 카드

```
┌─────────────────────────────────┐
│ [카테고리]                        │
│ 한국어 제목                        │
│ TechCrunch · 2026년 10월 14일     │
│                                   │
│ 한국어 요약 3~4문장                 │
│ ───────────────────────────────── │
│ 원문 보기 ↗            [Notion 저장] │
└─────────────────────────────────┘
```

### 그리드

```tsx
<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">…</div>
```

화면 폭에 따라 1열 → 2열(`sm`) → 3열(`xl`)이 됩니다. 최신 뉴스가 먼저 옵니다.

### 페이지 나누기

한 페이지에 카드 **9개**(3열 × 3줄)를 보여 주고, 그리드 아래 가운데에 페이지 번호를 둡니다.

```
[처음] [이전]  1 … 48 49 [50] 51 52 … 100  [다음] [끝]
```

- 번호 버튼: `h-8 min-w-8 sm:h-9 sm:min-w-9 rounded-lg px-2 text-sm font-medium`, 평소에는 카테고리 탭처럼 흰 바탕에 테두리, 현재 페이지는 `bg-blue-600 text-white` + `aria-current="page"`
- 첫 페이지(1)와 마지막 페이지는 항상 보여 주고, 현재 페이지 앞뒤로 2페이지씩 보여 줍니다.
- 번호가 건너뛰는 곳에만 "…"를 넣습니다. 현재 페이지 주변 번호가 1이나 마지막 페이지와 이어지면 그쪽 "…"는 생략합니다. (예: 4페이지 → `1 2 3 [4] 5 6 … 100`)
- 1페이지에서는 [처음]·[이전], 마지막 페이지에서는 [다음]·[끝]을 `disabled:opacity-50`로 비활성화합니다.
- 모바일에서는 번호가 첫 줄, [처음] [이전] [다음] [끝]이 둘째 줄에 옵니다. `sm` 이상은 한 줄입니다.
- 페이지가 1개뿐이면 페이지 번호를 숨깁니다.
- 카테고리 탭을 바꾸거나 새 뉴스를 가져오면 1페이지로 돌아갑니다. 페이지를 옮기면 화면 맨 위로 스크롤합니다.
- 제목 옆 개수(`24개`)는 현재 페이지가 아니라 선택한 탭의 전체 개수입니다.

### 카드 구성

| 순서 | 요소 | 클래스 |
|---|---|---|
| — | 카드 | `flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm` |
| 1 | 카테고리 배지 | `self-start rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-medium text-blue-700` |
| 2 | 제목 | `mt-4 text-lg font-semibold leading-snug break-keep text-slate-900` |
| 3 | 출처 · 날짜 | `mt-2 text-sm text-slate-500` |
| 4 | 요약 | `mt-4 text-[15px] leading-7 break-keep text-slate-600` |
| 5 | 하단 영역 | `mt-auto flex items-center justify-between border-t border-slate-100 pt-4` |

- **미분류 배지**는 회색입니다: `bg-slate-100 text-slate-600`
- **hover** 시 살짝 떠오릅니다: `transition hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200`
- **날짜**는 한국 시간 기준 "2026년 10월 14일" 형식입니다.
- **하단 영역**은 `mt-auto`로 항상 카드 바닥에 붙습니다.

### 하단 버튼

| 상태 | 모양 |
|---|---|
| 원문 보기 | 파란 글자 링크 `text-sm font-medium text-blue-600 hover:underline` |
| Notion 저장 | 파란 버튼 `rounded-lg bg-blue-600 px-3 py-1.5 text-white` |
| 저장 중… | 같은 버튼, 비활성화 `disabled:opacity-50` |
| ✓ 저장됨 | 연한 파란 버튼 `rounded-lg bg-blue-50 px-3 py-1.5 text-blue-700` (Notion 페이지 링크) |

외부 링크는 모두 새 탭으로 엽니다: `target="_blank" rel="noopener noreferrer"`

---

## 8. 상태 표시

| 상태 | 모양 | 예시 문구 |
|---|---|---|
| 로딩 | 회색 글자 `text-slate-500` | 뉴스를 불러오는 중… |
| 빈 화면 | 점선 박스 `rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center` | 아직 저장된 뉴스가 없어요. |
| 성공 안내 | 파란 박스 `rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700` | 새 뉴스 5개를 가져왔어요. |
| 오류 | 빨간 박스 `rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700` | The Verge 뉴스를 가져오지 못했어요. |

- 안내와 오류는 해당 영역 **바로 위**에 띄웁니다. 화면 전체를 막지 않습니다.
- 성공도 초록색 대신 파란색으로 표시합니다.

---

## 9. 새 화면 체크리스트

- [ ] 같은 헤더와 `max-w-6xl` 폭을 쓴다
- [ ] 회색은 `slate`, 강조는 `blue`, 위험한 동작만 `red`
- [ ] 색상 클래스마다 `dark:` 짝이 있다
- [ ] 한글 텍스트에 `break-keep`이 있다
- [ ] 360px 폭 화면에서 깨지지 않는다
- [ ] 로딩, 빈 화면, 오류를 모두 처리했다
