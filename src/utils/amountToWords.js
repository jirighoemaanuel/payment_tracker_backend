const SMALL_NUMBERS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

const convertHundreds = (num) => {
  if (num < 20) {
    return SMALL_NUMBERS[num];
  }

  if (num < 100) {
    const tensPart = TENS[Math.floor(num / 10)];
    const units = num % 10;
    return units ? `${tensPart} ${SMALL_NUMBERS[units]}` : tensPart;
  }

  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;
  const remainderWords = remainder ? ` and ${convertHundreds(remainder)}` : "";

  return `${SMALL_NUMBERS[hundreds]} hundred${remainderWords}`;
};

const convertNumberToWords = (num) => {
  if (num === 0) {
    return "zero";
  }

  const groups = [
    { value: 1_000_000_000, label: "billion" },
    { value: 1_000_000, label: "million" },
    { value: 1_000, label: "thousand" },
    { value: 1, label: "" },
  ];

  let remaining = num;
  const parts = [];

  for (const group of groups) {
    if (remaining >= group.value) {
      const groupAmount = Math.floor(remaining / group.value);
      remaining %= group.value;

      const words = convertHundreds(groupAmount);
      parts.push(group.label ? `${words} ${group.label}` : words);
    }
  }

  return parts.join(" ").trim();
};

const amountToWords = (amount) => {
  const wholeAmount = Math.floor(Number(amount) || 0);
  const decimalAmount = Math.round(((Number(amount) || 0) - wholeAmount) * 100);

  return {
    nairaWords: convertNumberToWords(wholeAmount),
    koboWords: convertNumberToWords(decimalAmount),
    wholeAmount,
    decimalAmount,
  };
};

export default amountToWords;
