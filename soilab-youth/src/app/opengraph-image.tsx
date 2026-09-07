import { ImageResponse } from 'next/og';

export const alt = '협동조합 소이랩 고립·은둔 청년 지원센터';
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
          color: '#19223F',
          background: '#F4F6FC',
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
            right: -90,
            top: -120,
            background: '#D9EAF0',
          }}
        />
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: 999,
            right: 210,
            bottom: -170,
            background: '#E2E6F5',
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
          <div style={{ display: 'flex', fontSize: 23, fontWeight: 700, letterSpacing: 3, color: '#46549C' }}>
            SOILAB YOUTH CENTER
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 900 }}>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 60, fontWeight: 700, lineHeight: 1.2 }}>
              <div style={{ display: 'flex' }}>고립·은둔청년의 회복을</div>
              <div style={{ display: 'flex' }}>지역에서 함께 만듭니다</div>
            </div>
            <div style={{ display: 'flex', marginTop: 26, fontSize: 27, lineHeight: 1.45, color: '#59627E' }}>
              발굴부터 일상회복·관계회복·사회참여까지 함께 걷는 협동조합 소이랩
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
                background: '#46549C',
                color: 'white',
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
