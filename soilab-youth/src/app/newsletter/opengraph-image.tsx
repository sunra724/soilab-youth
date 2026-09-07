import { ImageResponse } from 'next/og';

export const alt = '다시봄 뉴스클리핑 | 고립·은둔 청년 회복 지원 뉴스';
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
          position: 'relative',
          overflow: 'hidden',
          padding: '72px',
          color: 'white',
          background: 'linear-gradient(135deg, #176F89 0%, #248DAC 58%, #46549C 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: 999,
            right: -120,
            top: -150,
            border: '56px solid rgba(255,255,255,0.10)',
          }}
        />
        <div
          style={{
            display: 'flex',
            position: 'relative',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', fontSize: 23, fontWeight: 700, letterSpacing: 4, opacity: 0.82 }}>
            DASIBOM NEWS CLIPPING
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 930 }}>
            <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, lineHeight: 1.15 }}>
              다시봄 뉴스클리핑
            </div>
            <div style={{ display: 'flex', marginTop: 28, fontSize: 29, lineHeight: 1.45, opacity: 0.88 }}>
              고립·은둔 청년과 회복 지원 현장의 보도를 등록 언론사 원문으로 안내합니다.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 23, fontWeight: 700 }}>
            <div
              style={{
                display: 'flex',
                width: 42,
                height: 42,
                borderRadius: 11,
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white',
                color: '#248DAC',
              }}
            >
              S
            </div>
            협동조합 소이랩
          </div>
        </div>
      </div>
    ),
    size,
  );
}
