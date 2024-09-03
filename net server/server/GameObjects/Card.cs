namespace Server.GameObjects
{
    public class Card(List<SymbolData> symbols)
    {
        /// <summary>
        /// Symbols on a card.
        /// </summary>
        public readonly List<SymbolData> symbols = symbols;
    }
}
