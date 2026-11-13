import { useState, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { ComponentCard } from './components/ComponentCard';
import { TacticalArt } from './components/TacticalArt';
import { useComponentGenerator } from './hooks/useComponentGenerator';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { decodeApiKey, decodeProvider } from './utils/storedState';
import type { Provider } from './types';
import './App.css';

const PROVIDER_CONFIG = {
  anthropic: { label: 'Anthropic', placeholder: 'sk-ant-...' },
  google: { label: 'Google', placeholder: 'AIza...' },
} as const;

function App() {
  const [apiKey, setApiKey] = useLocalStorageState('atelier.apiKey', '', decodeApiKey);
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useLocalStorageState<Provider>('atelier.provider', 'google', decodeProvider);
  const [envKeys, setEnvKeys] = useState<Record<Provider, boolean>>({ anthropic: false, google: false });
  const { components, promptHistory, isLoading, error, generate, removeComponent, clearAll } = useComponentGenerator();
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
        <div className="brand"><span className="brand-mark" aria-hidden="true">⌘</span>Atelier / T</div>
        <span className="topbar-note">Interface engineering studio</span>
      </nav>
      <header className="app-header">
        <div className="header-copy">
          <span className="eyebrow">Design support terminal</span>
          <h1>당신의 아이디어를,<br />정교한 인터페이스로.</h1>
          <p>원하는 UI를 설명하세요. 구현은 제가 지원하겠습니다.<br />React 컴포넌트 생성부터 미리보기, 코드 확인까지.</p>
        </div>
        <div className="hero-art"><span className="hero-caption">Personal design assistant</span><TacticalArt /></div>
      </header>
      <main className="workspace">
        <section className="composer-panel" aria-label="컴포넌트 생성">
          <PromptInput onGenerate={handleGenerate} isLoading={isLoading} history={promptHistory} />
        </section>
        <aside className="settings-panel" aria-label="실행 설정">
          <div className="settings-header"><span className="panel-kicker">Connection</span><h2>연결 설정</h2></div>
          <div className="provider-select">
            <label htmlFor="provider">AI 프로바이더</label>
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
          <p className="settings-note">{PROVIDER_CONFIG[provider].label}를 사용합니다.<br />API 키를 연결하고 작업을 시작하세요.</p>
        </aside>
      </main>
      {error && <div className="error-banner" role="alert"><p>{error}</p></div>}
      <section className="results-section" aria-label="생성 결과">
        <div className="results-header">
          <div className="results-heading"><h2>컴포넌트 아카이브</h2><span className="result-count">{components.length}</span></div>
          {components.length > 0 ? <button className="btn-clear" onClick={clearAll}>전체 삭제</button> : <span className="results-hint">Preview & source code</span>}
        </div>
        {components.length === 0 && !isLoading && (
          <div className="empty-state">
            <TacticalArt small />
            <div className="empty-copy"><h2>작업 지시를 기다리고 있습니다.</h2><p>프롬프트를 입력하거나 예시를 선택하세요.<br />생성된 컴포넌트의 미리보기와 코드가 여기에 표시됩니다.</p><span className="empty-tag">생성된 컴포넌트가 없습니다</span></div>
          </div>
        )}
        {isLoading && <div className="loading-card" role="status"><div className="loading-pulse" /><p>컴포넌트 구현 중입니다...</p></div>}
        <div className="results-grid">{components.map((component) => <ComponentCard key={component.id} component={component} onRemove={removeComponent} onRegenerate={handleGenerate} isLoading={isLoading} />)}</div>
      </section>
      <footer className="app-footer"><span>Atelier / T — React component studio</span><span>정확하게, 차분하게. 당신의 다음 인터페이스.</span></footer>
    </div>
  );
}
export default App;
