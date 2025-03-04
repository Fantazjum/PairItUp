using System.Text.Json.Serialization;

namespace Server.GameObjects
{
    #pragma warning disable IDE1006 // Naming convention style
    public class GameRules(int maxPlayers = 4, int cardCount = 55, GameType? gameType = null)
    {
        /// <summary>
        /// Maximum number of players permitted in the game.
        /// </summary>
        public int maxPlayers { get; } = maxPlayers;
        /// <summary>
        /// Number of cards used in the game.
        /// </summary>
        public int cardCount { get; } = cardCount;
        /// <summary>
        /// Type of the game played.
        /// </summary>
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public GameType gameType { get; } = gameType ?? GameType.FirstComeFirstServed;
    }
    #pragma warning restore IDE1006 // Naming convention style
}
