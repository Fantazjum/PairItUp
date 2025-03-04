using Server.GameObjects;

namespace Server.Game
{
    public class CardList(int symbols, List<Card> cards)
    {
        /// <summary>
        /// Number of symbols on the cards in collection.
        /// </summary>
        public int symbols = symbols;
        /// <summary>
        /// Collection of the cards.
        /// </summary>
        public List<Card> cards = cards;
    }
}
