using Server.GameObjects;

namespace Server.DTO
{
    #pragma warning disable IDE1006 // Naming convention style
    public class RoomDTO(string id, List<PlayerDTO> players, List<PlayerDTO> spectators,
      Card? currentCard, bool inProgress, bool inSummary, GameRules gameRules, string hostId)
    {
        public string id { get; } = id;
        public List<PlayerDTO> players { get; } = players;
        public List<PlayerDTO> spectators { get; } = spectators;
        public Card? currentCard { get; } = currentCard;
        public bool inProgress { get; } = inProgress;
        public bool inSummary { get; } = inSummary;
        public GameRules gameRules { get; } = gameRules;
        public string hostId { get; } = hostId;
    }
    #pragma warning restore IDE1006 // Naming convention style
}
