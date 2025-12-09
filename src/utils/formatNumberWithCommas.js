export default function formatNumberWithCommas(value) {
  // 입력된 값을 숫자로 변환
  const numberValue = Number(value);

  // 숫자가 유효한지 확인
  if (isNaN(numberValue) || !isFinite(numberValue)) {
    return String(value); // 유효하지 않으면 원본 값 그대로 반환
  }

  // toLocaleString()을 사용하여 포맷팅
  return numberValue.toLocaleString('ko-KR'); // 한국 로케일 (세 자리 콤마)
}
