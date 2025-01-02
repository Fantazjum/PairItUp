// arbitrarily chosen limit
const LOWER_CARD_LIMIT = 21;
// upper limit calculated for maximum of 10 symbols
const UPPER_CARD_LIMIT = 91;

// default
const numberOfCards = 55;
// this is a hard limit
let numberOfSymbols = 5;
while (numberOfSymbols * (numberOfSymbols - 1) + 1 < numberOfCards) {
    numberOfSymbols++;
}
// total number of cards/symbols based on number of symbols on card: k^2 - k + 1
const upperLimits = {
    5: 21,
    6: 31,
    7: 43,
    8: 57,
    9: 73,
    10: 91,
};

// PNG imageSize = 150x150
