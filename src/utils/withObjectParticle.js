/*
  withObjectParticle.js
  단어에 목적격 조사 '을/를'을 붙여 반환하는 함수
  예: 사과 -> 사과를, 책 -> 책을
*/
export default function withObjectParticle(word) {
  const lastChar = word.charCodeAt(word.length - 1);
  const hasFinalConsonant = (lastChar - 44032) % 28 !== 0;
  return `${word}${hasFinalConsonant ? '을' : '를'}`;
}
