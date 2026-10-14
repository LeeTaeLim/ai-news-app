import { notFound } from "next/navigation";
import type { ArticleCard } from "@/lib/articles";
import { NewsGrid, NewsShell } from "../news-layout";

// Dev-only design preview: the main page's real components with sample data,
// viewable without signing in. Returns 404 in production builds.

const SAMPLE_ARTICLES: ArticleCard[] = [
  {
    id: "sample-1",
    source: "techcrunch",
    titleKo: "케스트럴 랩스, 코딩 벤치마크 1위 오픈 웨이트 모델 '케스트럴-3' 공개",
    summaryKo:
      "AI 스타트업 케스트럴 랩스가 오픈 웨이트 언어 모델 '케스트럴-3'를 공개했다. 이 모델은 주요 코딩 벤치마크에서 기존 공개 모델들을 앞서는 성능을 기록했다고 회사는 밝혔다. 가중치는 상업적 이용이 가능한 라이선스로 배포되며, 소형 버전은 일반 노트북에서도 실행할 수 있다. 회사는 학습 데이터 구성과 평가 방법을 담은 기술 보고서도 함께 공개했다.",
    link: "https://techcrunch.com/2026/10/14/kestrel-labs-releases-kestrel-3-open-weight-model/",
    publishedAt: new Date("2026-10-14T09:30:00Z"),
    categoryName: "AI 모델/연구",
    notionPageUrl: null,
  },
  {
    id: "sample-2",
    source: "theverge",
    titleKo: "루모라 AI 메모 앱, 통화 내용을 기기에서 바로 받아쓰고 요약한다",
    summaryKo:
      "AI 메모 앱 루모라가 전화 통화를 실시간으로 받아쓰고 요약하는 기능을 추가했다. 모든 처리는 클라우드가 아닌 기기 안에서 이뤄져 통화 내용이 외부 서버로 전송되지 않는다. 요약에는 주요 결정 사항과 후속 할 일이 자동으로 정리된다. 이 기능은 유료 구독자에게 먼저 제공되고 연말까지 무료 사용자로 확대될 예정이다.",
    link: "https://www.theverge.com/2026/10/13/lumora-ai-notes-phone-call-summaries",
    publishedAt: new Date("2026-10-13T21:15:00Z"),
    categoryName: "제품/서비스",
    notionPageUrl: null,
  },
  {
    id: "sample-3",
    source: "techcrunch",
    titleKo: "벡터라인, 엣지 기기용 추론 칩 개발 위해 2억 1천만 달러 시리즈 C 유치",
    summaryKo:
      "AI 반도체 스타트업 벡터라인이 2억 1천만 달러 규모의 시리즈 C 투자를 유치했다. 회사는 스마트폰, 카메라, 산업용 장비 같은 엣지 기기에서 AI 모델을 저전력으로 실행하는 추론 전용 칩을 개발하고 있다. 이번 자금은 양산 준비와 소프트웨어 개발 도구 확충에 쓰일 예정이다. 업계에서는 클라우드 의존도를 낮추려는 수요가 커지면서 엣지 AI 칩 시장 경쟁이 치열해지고 있다고 본다.",
    link: "https://techcrunch.com/2026/10/13/vectorline-raises-210m-series-c-edge-inference-chips/",
    publishedAt: new Date("2026-10-13T16:00:00Z"),
    categoryName: "투자/비즈니스",
    notionPageUrl: "https://www.notion.so/sample-vectorline-series-c-0000000000000000",
  },
  {
    id: "sample-4",
    source: "theverge",
    titleKo: "AI로 만든 정치 광고에 명확한 표시를 의무화하는 주 법안 발의",
    summaryKo:
      "한 주 의회에 AI로 생성하거나 조작한 정치 광고에 눈에 띄는 표시를 의무화하는 법안이 발의됐다. 법안은 선거 90일 전부터 표시 없는 AI 생성 광고의 배포를 금지하고, 위반하면 벌금을 물리도록 했다. 지지자들은 딥페이크로 인한 유권자 혼란을 막을 수 있다고 주장한다. 반면 일부 단체는 표현의 자유를 침해할 수 있다며 우려를 나타냈다.",
    link: "https://www.theverge.com/2026/10/12/state-bill-ai-generated-political-ads-labels",
    publishedAt: new Date("2026-10-12T14:40:00Z"),
    categoryName: "정책/규제",
    notionPageUrl: null,
  },
  {
    id: "sample-5",
    source: "techcrunch",
    titleKo: "쉬는 시간에 체스를 배운 물류 로봇, 실력이 예상보다 뛰어나다",
    summaryKo:
      "한 물류 로봇 업체의 엔지니어들이 유휴 시간의 로봇 팔에 체스를 두도록 학습시켰다. 로봇은 카메라로 실제 체스판을 인식하고 말을 직접 옮기며, 사내 대회에서 대부분의 직원을 이겼다. 회사는 이 실험이 정밀한 물체 조작 능력을 검증하는 데 도움이 됐다고 설명했다. 영상이 소셜 미디어에서 화제가 되면서 회사는 체스 로봇을 전시회에 선보일 계획이다.",
    link: "https://techcrunch.com/2026/10/11/warehouse-robot-learned-chess-downtime/",
    publishedAt: new Date("2026-10-11T18:05:00Z"),
    categoryName: null,
    notionPageUrl: null,
  },
];

export default function PreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <NewsShell
      userMenu={
        // Stand-in for Clerk's <UserButton />, which needs a session.
        <span className="size-7 rounded-full bg-blue-100 ring-1 ring-blue-200 dark:bg-blue-900 dark:ring-blue-800" />
      }
    >
      <NewsGrid articles={SAMPLE_ARTICLES} />
    </NewsShell>
  );
}
