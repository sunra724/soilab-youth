import { ImageResponse } from 'next/og';

export const alt = '소이랩 고립·은둔청년 리빙랩 실증·성과 대시보드';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          color: 'white',
          background: 'linear-gradient(135deg, #363F7A 0%, #46549C 58%, #248DAC 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, letterSpacing: 4, opacity: 0.78 }}>
          SOILAB YOUTH LIVING LAB
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 920 }}>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, lineHeight: 1.2 }}>
            고립·은둔청년을 기다리지 않고 발견합니다
          </div>
          <div style={{ display: 'flex', marginTop: 28, fontSize: 28, lineHeight: 1.45, opacity: 0.82 }}>
            비대면 발굴부터 일상회복·관계회복·사회참여까지 지역 안에서 함께 설계하고 실증합니다.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 24, fontWeight: 700 }}>
          <div style={{ display: 'flex', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', background: 'white', color: '#46549C' }}>S</div>
          협동조합 소이랩
        </div>
      </div>
    ),
    size,
  );
}
