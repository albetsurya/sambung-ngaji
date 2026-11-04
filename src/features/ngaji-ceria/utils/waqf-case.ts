const input = 'وَجَعَلْنَا ذُرِّيَّةٗ هُمُ الْبٰقِيْنَ ○';
console.log('Full input chars:');
for (let i = 0; i < input.length; i++) {
  console.log(i, input.charCodeAt(i).toString(16), JSON.stringify(input[i]));
}

console.log('\nLast word chars:');
const lastWord = 'ذُرِّيَّةٗ';
for (let i = 0; i < lastWord.length; i++) {
  console.log(i, lastWord.charCodeAt(i).toString(16), JSON.stringify(lastWord[i]));
}
