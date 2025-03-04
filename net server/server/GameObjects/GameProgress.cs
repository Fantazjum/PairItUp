using MoreLinq.Extensions;
using Newtonsoft.Json;
using Server.Game;
using Server.Utils;

namespace Server.GameObjects
{
    public class GameProgress(GameRules rules)
    {
        /// <summary>
        /// Mutex queue for accessing symbol
        /// </summary>
        private readonly MutexQueue _symbolQueue = new();
        /// <summary>
        /// Flag for checking whether to return information that the answer was given too late
        /// </summary>
        private bool _isCurrentDone = false;
        /// <summary>
        /// Flag for checking whether to return information that the answer was given too late
        /// </summary>
        public bool IsCurrentDone { get { return _isCurrentDone; } }
        /// <summary>
        /// Cards currently in play.
        /// </summary>
        private readonly List<Card> cards = InitCards(rules);
        /// <summary>
        /// The current card in play.
        /// </summary>
        public Card? currentCard;

        /// <summary>
        /// Initializes cards for the game with the specified game rules.
        /// </summary>
        /// <param name="rules"></param>
        /// <returns></returns>
        private static List<Card> InitCards(GameRules rules)
        {
            var cardsMinSymbolCount = 5;
            var lowerLimit = cardsMinSymbolCount * (cardsMinSymbolCount - 1) + 1;
            // this sets the hard upper limit of number of cards and symbols
            while (lowerLimit < rules.cardCount)
            {
                cardsMinSymbolCount++;
                if (cardsMinSymbolCount == 7) {
                    cardsMinSymbolCount++;
                }
                lowerLimit = cardsMinSymbolCount * (cardsMinSymbolCount - 1) + 1;
            }

            // random is exclusive
            var displacement = new Random().Next(91 + 1 - lowerLimit);

            var symbolsCount = Math.Max(rules.maxPlayers, cardsMinSymbolCount);
            var cards = LoadCards(symbolsCount) ?? [];
            foreach(var card in cards)
            {
                foreach(var symbol in card.symbols)
                {
                    symbol.symbol += displacement;
                }
            }

            return ShuffleExtension.Shuffle(cards).Slice(0, rules.cardCount).ToList();
        }

        /// <summary>
        /// Loads card list from the json file.
        /// </summary>
        /// <param name="symbols"></param>
        /// <returns></returns>
        private static List<Card>? LoadCards(int symbols)
        {
            Directory.SetCurrentDirectory(AppDomain.CurrentDomain.BaseDirectory);
            var root = Directory.GetCurrentDirectory();
            var path = root + "/Game/GameTypes.json";

            using StreamReader r = new(path);
            var json = r.ReadToEnd();

            var cards = JsonConvert.DeserializeObject<List<CardList>>(json);

            return cards?.Find(cardList => cardList.symbols == symbols)?.cards;
        }

        /// <summary>
        /// Gets next card from the list.
        /// </summary>
        /// <returns>Card or null if the list of cards is spent.</returns>
        public Card? GetNextCard()
        {
            var card = cards.Count > 0 ? cards.First() : null;
            if (card != null)
            {
                cards.Remove(card);
            }

            return card;
        }

        /// <summary>
        /// Tries to continue the round after awarding the point.
        /// </summary>
        /// <returns>True if there are more cards, false if cards run out.</returns>
        public bool ContinueRound()
        {
            _symbolQueue.SyncAwaitAll();

            currentCard = GetNextCard();
            _isCurrentDone = false;

            return currentCard != null;
        }

        /// <summary>
        /// Checks the current card in play for a given symbol.
        /// </summary>
        /// <param name="checkedSymbol"></param>
        /// <param name="checkedSymbol"></param>
        /// <returns>True if symbol exists on a card, false if there is none. Null is returned if another player was first to find the symbol.</returns>
        public bool? CheckSymbol(int checkedSymbol, string playerId)
        {
            if (_isCurrentDone)
            {
                return null;
            }

            return (bool?)_symbolQueue.SyncModifyData(playerId, () => {
                var symbolExists = currentCard?.symbols
                    .Find(symbol => symbol.symbol == checkedSymbol);
                bool? answer = _isCurrentDone ? null : symbolExists != null;

                return answer;
            });
        }
    }
}
