using Server.GameObjects;

namespace Server.game {
    public class CardList(int symbols, List<List<SymbolData>> cards) {
        /// <summary>
        /// Number of symbols on the cards in collection.
        /// </summary>
        public int symbols = symbols;
        /// <summary>
        /// Collection of the cards.
        /// </summary>
        public List<List<SymbolData>> cards = cards;

        public List<Card> ExtractCards() {
            return cards.Select(dataList => {
              return new Card(dataList);
            }).ToList();
        }
    }
}
