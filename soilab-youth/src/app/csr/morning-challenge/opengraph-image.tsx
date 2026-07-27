import { ImageResponse } from 'next/og';

export const alt = '다시 시작하는 아침, 혼자가 아니도록 | 모닝챌린지';
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
          color: '#20372F',
          background: '#F8F1DF',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            width: 360,
            height: 360,
            borderRadius: 999,
            right: -45,
            top: -70,
            background: '#F5C95C',
          }}
        />
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: 999,
            right: 170,
            bottom: -180,
            background: '#CFE5D8',
          }}
        />
        <div style={{ display: 'flex', position: 'relative', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 22, fontWeight: 700, letterSpacing: 3, color: '#2F6B57' }}>
            SOILAB CSR · MORNING CHALLENGE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 880 }}>
            <div style={{ display: 'flex', fontSize: 66, fontWeight: 700, lineHeight: 1.18 }}>
              다시 시작하는 아침,
              <br />
              혼자가 아니도록.
            </div>
            <div style={{ display: 'flex', marginTop: 26, fontSize: 27, lineHeight: 1.5, color: '#53645E' }}>
              고립·은둔청년의 작은 일상 회복을 기업과 지역사회가 함께 지원합니다.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 22, fontWeight: 700 }}>
            <div
              style={{
                display: 'flex',
                width: 40,
                height: 40,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                background: '#2F6B57',
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
