import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canonicalizeMohwNewsUrl,
  isMohwYouthNews,
  mohwNewsTitleKey,
  selectMohwYouthNews,
} from '../src/lib/mohwYouthNews.ts';

test('청년미래센터와 고립은둔·가족돌봄청년 보도자료를 선별한다', () => {
  assert.equal(
    isMohwYouthNews('청년미래센터 전담지원 서비스를 시작합니다'),
    true,
  );
  assert.equal(
    isMohwYouthNews('위기청년 발굴체계 강화', '고립·은둔 청년의 일상 회복 프로그램을 지원한다.'),
    true,
  );
  assert.equal(
    isMohwYouthNews('가족 지원 강화', '가족돌봄청소년에게 자기돌봄비를 지원한다.'),
    true,
  );
});

test('청년과 무관한 고립·돌봄 보도자료는 제외한다', () => {
  assert.equal(
    isMohwYouthNews('독거 어르신 지역 인적안전망이 지킨다', '고립과 가족 돌봄이 필요한 노인을 발굴한다.'),
    false,
  );
  assert.equal(
    isMohwYouthNews('청년내일저축계좌 가입자 소득 증가', '저소득 청년의 자산 형성을 지원한다.'),
    false,
  );
});

test('보건복지부 상세 URL을 고정 형식으로 정규화한다', () => {
  assert.equal(
    canonicalizeMohwNewsUrl('https://www.mohw.go.kr/board.es?act=view&amp;bid=0027&amp;list_no=1482747&amp;mid=a10503000000&amp;nPage=54&amp;tag='),
    'https://www.mohw.go.kr/board.es?mid=a10503000000&bid=0027&list_no=1482747&act=view',
  );
  assert.equal(canonicalizeMohwNewsUrl('https://example.com/board.es?list_no=1'), '');
});

test('공식 RSS 항목을 정리하고 관련 없는 항목을 버린다', () => {
  const items = selectMohwYouthNews([
    {
      title: '<b>청년미래센터</b> 지원 서비스 시작',
      link: 'https://www.mohw.go.kr/board.es?mid=a10503000000&bid=0027&list_no=1482747&act=view',
      description: '<p>가족돌봄청년과 고립·은둔 청년을 지원합니다.</p>',
      pubDate: 'Wed, 14 Aug 2024 05:54:00 GMT',
    },
    {
      title: '장기요양위원회 개최',
      link: 'https://www.mohw.go.kr/board.es?mid=a10503000000&bid=0027&list_no=1&act=view',
      description: '장기요양 정책을 논의합니다.',
    },
  ]);

  assert.equal(items.length, 1);
  assert.equal(items[0].title, '청년미래센터 지원 서비스 시작');
  assert.equal(items[0].description, '가족돌봄청년과 고립·은둔 청년을 지원합니다.');
});

test('Google News의 보건복지부 출처 꼬리를 제거해 제목 중복 키를 만든다', () => {
  assert.equal(
    mohwNewsTitleKey('청년미래센터 지원 서비스 시작 - 보건복지부'),
    mohwNewsTitleKey('청년미래센터 지원 서비스 시작'),
  );
});
