import { useState, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { ComponentCard } from './components/ComponentCard';
import { Friends } from './components/Friends';
import { useComponentGenerator } from './hooks/useComponentGenerator';
import type { Provider } from './types';
import './App.css';

const PROVIDER_CONFIG = {
  anthropic: { label: 'Anthropic', placeholder: 'sk-ant-...' },
  google: { label: 'Google', placeholder: 'AIza...' },
} as const;

function App() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useState<Provider>('google');
  const [envKeys, setEnvKeys] = useState<Record<Provider, boolean>>({ anthropic: false, google: false });
  const { components, isLoading, error, generate, removeComponent, clearAll } = useComponentGenerator();
  useEffect(() => {
    fetch('/api/config').then((res) => res.json()).then((data) => setEnvKeys(data.envKeys)).catch(() => {});
  }, []);
  const hasEnvKey = envKeys[provider];
  const handleGenerate = (prompt: string) => {
    if (!apiKey.trim() && !hasEnvKey) {
      alert(`${PROVIDER_CONFIG[provider].label} API 키를 입력하거나 .env에 설정해주세요.`);
      return;
    }
    generate(prompt, apiKey || undefined, provider);
  };
  return (
    <div className="app">
      <nav className="topbar" aria-label="브랜드">
        <div className="brand"><span className="brand-mark" aria-hidden="true">✿</span>조그만 UI 공방</div>
        <span className="topbar-note">작은 아이디어가 자라는 곳 ♡</span>
      </nav>
      <header className="app-header">
        <div className="header-copy">
          <span className="eyebrow">React component studio</span>
          <h1>만들고 싶은 마음을,<br />작고 귀여운 UI로.</h1>
          <p>떠오른 아이디어를 한 줄로 적어주세요.<br />미리보기부터 React 코드까지, 여기서 함께 만들어요.</p>
        </div>
        <div className="hero-art"><span className="hero-caption">오늘도 조그맣게, 하나씩!</span><Friends /></div>
      </header>
      <main className="workspace">
        <section className="composer-panel" aria-label="컴포넌트 생성">
          <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />
        </section>
        <aside className="settings-panel" aria-label="실행 설정">
          <div className="settings-header"><span className="panel-kicker">준비는 간단하게</span><h2>공방 연결 설정</h2></div>
          <div className="provider-select">
            <label htmlFor="provider">함께 만들 AI</label>
            <select id="provider" value={provider} onChange={(e) => { setProvider(e.target.value as Provider); setApiKey(''); }}>
              {Object.entries(PROVIDER_CONFIG).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
          <div className="api-key-input">
            <label htmlFor="api-key">API 키</label>
            <div className="api-key-field">
              <input id="api-key" type={showKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={hasEnvKey ? '서버 키 연결됨 · 직접 입력 가능' : PROVIDER_CONFIG[provider].placeholder} />
              <button className="btn-toggle-key" onClick={() => setShowKey(!showKey)} type="button" aria-pressed={showKey}>{showKey ? '숨기기' : '보기'}</button>
            </div>
            <p className={`key-status ${hasEnvKey ? 'key-status--ready' : ''}`}>{hasEnvKey ? '서버 키가 연결되어 있어요.' : 'API 키를 입력하거나 서버 환경변수를 설정하세요.'}</p>
          </div>
          <p className="settings-note">✧ {PROVIDER_CONFIG[provider].label}와 함께 만들어요.<br />준비가 되면 첫 아이디어를 적어보세요.</p>
        </aside>
      </main>
      {error && <div className="error-banner" role="alert"><p>{error}</p></div>}
      <section className="results-section" aria-label="생성 결과">
        <div className="results-header">
          <div className="results-heading"><h2>우리의 작업 공간</h2><span className="result-count">{components.length}</span></div>
          {components.length > 0 ? <button className="btn-clear" onClick={clearAll}>전체 삭제</button> : <span className="results-hint">아이디어가 컴포넌트가 되는 순간</span>}
        </div>
        {components.length === 0 && !isLoading && (
          <div className="empty-state">
            <Friends small />
            <div className="empty-copy"><h2>첫 번째 작품을 기다리고 있어요</h2><p>위에 만들고 싶은 UI를 적거나 예시를 골라보세요.<br />완성된 컴포넌트는 이곳에 차곡차곡 모여요.</p><span className="empty-tag">작은 시작도 좋아요 ♡</span></div>
          </div>
        )}
        {isLoading && <div className="loading-card" role="status"><div className="loading-pulse" /><p>아이디어를 컴포넌트로 만들고 있어요...</p></div>}
        <div className="results-grid">{components.map((component) => <ComponentCard key={component.id} component={component} onRemove={removeComponent} onRegenerate={handleGenerate} isLoading={isLoading} />)}</div>
      </section>
      <footer className="app-footer"><span>조그만 UI 공방 · React로 만드는 작은 즐거움</span><span>천천히 만들어도 괜찮아요 ♡</span></footer>
    </div>
  );
}
export default App;
