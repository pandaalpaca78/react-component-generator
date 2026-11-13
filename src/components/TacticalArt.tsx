import tokiAssistant from '../assets/toki-assistant.png';

interface TacticalArtProps { small?: boolean }

export function TacticalArt({ small = false }: TacticalArtProps) {
  return (
    <div className={small ? 'tactical-art tactical-art--small' : 'tactical-art'} aria-hidden="true">
      <img src={tokiAssistant} alt="" width={1184} height={1328} decoding="async" />
    </div>
  );
}
