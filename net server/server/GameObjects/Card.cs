namespace Server.GameObjects
{
    public class Card(List<SymbolData> symbols)
    {
        /// <summary>
        /// Symbols on a card.
        /// </summary>
        #pragma warning disable IDE1006 // Naming convention style
        public List<SymbolData> symbols { get; } = symbols;
        #pragma warning restore IDE1006 // Naming convention style

        public void IncrementSymbols(int incrementValue)
        {
            foreach (var symbol in symbols)
            {
                symbol.symbol += incrementValue;
            }
        }
    }
}
