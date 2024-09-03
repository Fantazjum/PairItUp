namespace Server.GameObjects
{
    public class SymbolData(int symbol, int size, int vertical, int horizontal, double rotation)
    {
        /// <summary>
        /// Identifier of symbol.
        /// </summary>
        public readonly int symbol = symbol;
        /// <summary>
        /// Size of the symbol relative to 150x150 card size.
        /// </summary>
        public readonly int size = size;
        /// <summary>
        /// Vertical coordinates of the symbol on a card, relative to 150x150 card size.
        /// </summary>
        public readonly int vertical = vertical;
        /// <summary>
        /// Horizontal coordinates of the symbol on a card, relative to 150x150 card size.
        /// </summary>
        public readonly int horizontal = horizontal;
        /// <summary>
        /// Rotation of the symbol on the card.
        /// </summary>
        public readonly double rotation = rotation;
    }
}
