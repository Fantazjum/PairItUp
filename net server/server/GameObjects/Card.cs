namespace Server.GameObjects
{
    public class Card(List<SymbolData> symbols)
    {
        /// <summary>
        /// Symbols on a card.
        /// </summary>
        public List<SymbolData> symbols { get; } = symbols;
    }
}
