
import { Shot } from './types';

export const SYSTEM_NAME = "EDEN BEAUTY 자비스";
export const BRAND_COLORS = {
  MAIN_BLACK: "#000000",
  SUB_WHITE: "#FFFFFF",
  SKY_BLUE: "#87CEEB"
};

export const INITIAL_SHOT_DB: Shot[] = [
  // A. 도입부
  { id: '1', category: '도입부 (3초 후킹)', name: '거절 손짓', action: '카메라 거부', description: '카메라를 향해 검지 손가락을 흔들거나 손바닥을 내밀어 강하게 거부하는 동작.', link: 'https://example.com/ref1' },
  { id: '2', category: '도입부 (3초 후킹)', name: '모공 돌진', action: '초밀착 확대', description: '고민 부위를 렌즈 5cm 앞까지 0.5초 만에 바짝 밀착시키는 줌.', link: 'https://example.com/ref2' },
  { id: '3', category: '도입부 (3초 후킹)', name: '비밀 귓속말', action: '속삭임', description: '카메라 쪽으로 상체를 숙이고 손으로 입 옆을 가려 비밀을 말하는 포즈.', link: 'https://example.com/ref3' },
  { id: '4', category: '도입부 (3초 후킹)', name: '눈물 광공', action: '슬픈 표정', description: '거울 속 내 피부를 보며 세상에서 가장 슬픈 표정으로 한숨 쉬거나 울상 짓기.', link: 'https://example.com/ref4' },
  { id: '5', category: '도입부 (3초 후킹)', name: '충격 리액션', action: '놀람', description: '핸드폰이나 거울을 보다가 너무 놀라 뒤로 한 걸음 물러나며 입을 벌리는 동작.', link: 'https://example.com/ref5' },
  
  // B. 전개부
  { id: '6', category: '전개부 (증거/과정)', name: '증거 투척', action: '내밀기', description: '영수증, 결제 화면, 혹은 다 쓴 공병 더미를 카메라 렌즈 향해 툭 던지듯 내밀기.', link: 'https://example.com/ref6' },
  { id: '7', category: '전개부 (증거/과정)', name: '매장 진입', action: '팔로우 샷', description: '매장이나 샵 입구에서 안쪽 진열대까지 카메라가 모델을 빠르게 따라 들어가는 무빙.', link: 'https://example.com/ref7' },
  { id: '8', category: '전개부 (증거/과정)', name: '도구 삽질', action: '초근접 사용', description: '스패출러나 전용 기구로 피부를 긁거나 제품을 펴 바르는 손동작 초근접 샷.', link: 'https://example.com/ref8' },
  { id: '9', category: '전개부 (증거/과정)', name: '공병 폭포', action: '쏟아내기', description: '바구니에 담긴 수십 개의 공병을 바닥에 와르르 쏟아내는 역동적 장면.', link: 'https://example.com/ref9' },
  { id: '10', category: '전개부 (증거/과정)', name: '내부자 시점', action: '핸드헬드', description: '진열대 사이 혹은 선반 너머로 카메라가 제품을 몰래 지켜보는 듯한 핸드헬드 무빙.', link: 'https://example.com/ref10' },

  // C. 클라이맥스
  { id: '11', category: '클라이맥스 (결과)', name: '피지 긁기', action: '결과 포착', description: '도구에 피지가 뭉쳐 나오는 찰나를 흔들림 없이 포착하는 초밀착 근접 촬영.', link: 'https://example.com/ref11' },
  { id: '12', category: '클라이맥스 (결과)', name: '바이너리 하프', action: '피부 반전', description: '얼굴 반을 손으로 가리고 있다가 문구에 맞춰 손을 치우며 반전 피부 노출.', link: 'https://example.com/ref12' },
  { id: '13', category: '클라이맥스 (결과)', name: '팩 떼기', action: '카타르시스', description: '얼굴에 밀착된 팩을 가장자리부터 쫀득하게 한 번에 떼어내는 1초 컷.', link: 'https://example.com/ref13' },
  { id: '14', category: '클라이맥스 (결과)', name: '광택 부심', action: '틸트 샷', description: '고개를 좌우로 천천히 돌리며 피부의 반사광을 조명에 반사시키는 틸트 샷.', link: 'https://example.com/ref14' },
  { id: '15', category: '클라이맥스 (결과)', name: '탄력 탱글', action: '피부 탄력', description: '검지로 볼을 콕 찔렀을 때 피부가 즉각적으로 차오르는 탄력 시연 샷.', link: 'https://example.com/ref15' }
];

export const HOOK_STRATEGIES = [
  "상식파괴", "손실회피", "결과선공개", "금지/비밀", "논쟁/반박", "경험/권위", "내부자증언", "대비효과", 
  "실험/검증", "긴급성", "타겟저격", "시각적질문", "오해깨기", "구조공식", "사회적증명", "가격충격", "약속/보장", "캐릭터훅"
];

export const FLOW_PATHS = [
  "가성비전도", "시각카타르시스", "내부자밀고", "제3자증명", "상식재구성", "고통-구원", "전문기술", "시계열신뢰", "TPO밀착", "상징적투자"
];
