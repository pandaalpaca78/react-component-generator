import { useId, useState } from 'react';
import { isPromptLengthValid, MAX_PROMPT_LENGTH } from '../utils/validatePromptLength';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  history?: string[];
}

const EXAMPLE_LABELS = ['대시보드 카드', '알림 설정', '검색 필터', '체크리스트', '요금제 카드', '고객 상세 패널'];
const EXAMPLE_ICONS = ['▦', '◉', '⌕', '☑', '◇', '▤'];
const EXAMPLES = [
  'SaaS 관리자용 KPI 카드 3개. 매출, 활성 사용자, 전환율을 비교 가능한 형태로 표시',
  '설정 페이지의 알림 토글 패널. 이메일, 슬랙, 주간 리포트 옵션 포함',
  '검색 필터 바. 상태, 담당자, 날짜 범위를 선택하고 결과 수를 보여주는 UI',
  '온보딩 체크리스트. 5단계 진행률과 완료/대기 상태를 보여주는 카드',
  '요금제 비교 카드 3개. 추천 플랜을 강조하고 CTA 버튼 포함',
  '테이블 행 상세보기 패널. 선택한 고객의 기본 정보와 최근 활동 표시',
];

export function PromptInput({ onGenerate, isLoading, history = [] }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const feedbackId = useId();
  const isLengthValid = isPromptLengthValid(prompt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && isLengthValid && !isLoading) {
      onGenerate(prompt.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="prompt-section">
      <div className="prompt-heading">
        <span className="panel-kicker">새 컴포넌트</span>
        <h2>무엇을 만들까요?</h2>
      </div>
      <form onSubmit={handleSubmit} className="prompt-form">
        <textarea
          aria-label="만들고 싶은 컴포넌트"
          aria-invalid={!isLengthValid}
          aria-describedby={feedbackId}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="예: 화이트와 블루 톤의 프로필 카드. 프로필 이미지, 이름, 소개와 팔로우 버튼을 넣어줘."
          className="prompt-textarea"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e);
            }
          }}
        />
        <div id={feedbackId} className={`prompt-feedback${!isLengthValid ? ' prompt-feedback--error' : ''}`}>
          {!isLengthValid && <span role="alert">프롬프트는 {MAX_PROMPT_LENGTH}자 이하로 입력해주세요.</span>}
          <span className="prompt-count">{prompt.length} / {MAX_PROMPT_LENGTH}자</span>
        </div>
        <div className="prompt-footer">
        <span className="shortcut"><kbd>Ctrl</kbd> + <kbd>Enter</kbd> 로도 만들 수 있어요</span>
        <button
          type="submit"
          className="btn-generate"
          disabled={!prompt.trim() || !isLengthValid || isLoading}
        >
          {isLoading ? (
            <span className="loading-spinner">생성 중...</span>
          ) : (
            '컴포넌트 생성'
          )}
        </button>
        </div>
      </form>
      <div className="prompt-examples">
        <span className="examples-label">빠른 시작</span>
        {EXAMPLES.map((example, index) => (
          <button
            key={example}
            className="example-chip"
            onClick={() => handleExampleClick(example)}
            type="button"
          >
            <span className="example-icon" aria-hidden="true">{EXAMPLE_ICONS[index]}</span>{EXAMPLE_LABELS[index]}
          </button>
        ))}
      </div>
      {history.length > 0 && (
        <section className="prompt-examples" aria-label="프롬프트 히스토리">
          <span className="examples-label">최근 프롬프트</span>
          {history.map((item) => (
            <button key={item} type="button" className="example-chip" onClick={() => setPrompt(item)}>{item}</button>
          ))}
        </section>
      )}
    </div>
  );
}
