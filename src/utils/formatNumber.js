/**
 * 숫자를 한국 로케일(세자리 콤마)로 포맷하고 단위까지 붙여주는 함수
 *
 * @param {string|number} value - 포맷할 숫자
 * @param {string} unit - 숫자 뒤에 붙일 단위 (optional)
 * @returns {string}
 */
export function formatNumber(value, unit = '') {
  // 빈값 처리
  if (value === null || value === undefined || value === '') return '';

  // 숫자로 변환
  const numberValue = Number(value);

  // 3) 유효 숫자 체크
  if (isNaN(numberValue) || !isFinite(numberValue)) {
    return String(value); // 숫자 아님 → 원본 그대로 반환
  }

  // 숫자 포맷팅
  const formattedNumber = numberValue.toLocaleString('ko-KR');

  // 단위까지 붙여서 반환
  return unit ? `${formattedNumber} ${unit}` : formattedNumber;
}
