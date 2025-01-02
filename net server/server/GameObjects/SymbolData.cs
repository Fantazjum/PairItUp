namespace Server.GameObjects
{
    public class SymbolData(int symbol, int size, int vertical, int horizontal, double rotation)
    {
        /// <summary>
        /// Identifier of symbol.
        /// </summary>
        public int symbol { get; } = symbol;
        /// <summary>
        /// Size of the symbol relative to 150x150 card size.
        /// </summary>
        public int size { get; } = size;
        /// <summary>
        /// Vertical coordinates of the symbol on a card, relative to 150x150 card size.
        /// </summary>
        public int vertical { get; } = vertical;
        /// <summary>
        /// Horizontal coordinates of the symbol on a card, relative to 150x150 card size.
        /// </summary>
        public int horizontal { get; } = horizontal;
        /// <summary>
        /// Rotation of the symbol on the card.
        /// </summary>
        public double rotation { get; } = rotation;
    }
}
