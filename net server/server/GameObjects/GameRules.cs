namespace Server.GameObjects
{
    public class GameRules(int maxPlayers = 8, int cardCount = 55, GameType? gameType = null)
    {
        /// <summary>
        /// Maximum number of players permitted in the game.
        /// </summary>
        public int maxPlayers = maxPlayers;
        /// <summary>
        /// Number of cards used in the game.
        /// </summary>
        public int cardCount = cardCount;
        /// <summary>
        /// Type of the game played.
        /// </summary>
        public GameType gameType = gameType ?? GameType.FirstComeFirstServed;
    }
}
