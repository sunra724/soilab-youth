import { ImageResponse } from 'next/og';

export const alt = '청년과 함께 일상회복의 방법을 찾고 실험하는 소이랩 리빙랩';
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
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 64, fontWeight: 700, lineHeight: 1.2 }}>
            <span>청년과 함께,</span>
            <span>일상회복의 방법을</span>
            <span>찾고 실험합니다</span>
          </div>
          <div style={{ display: 'flex', marginTop: 28, fontSize: 28, lineHeight: 1.45, opacity: 0.82 }}>
            현장의 질문 · 함께하는 과정 · 기록과 배움
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
