using Server.GameObjects;

namespace Server.DTO
{
    #pragma warning disable IDE1006 // Naming convention style
    public class PlayerDTO(string id, string username = "", int score = 0, bool connected = true, Card? currentCard = null)
    {
        public string id { get; } = id;
        public string username { get; } = username;
        public int score { get; } = score;
        public Card? currentCard { get; } = currentCard;
        public bool connected { get; } = connected;
    }
    #pragma warning restore IDE1006 // Naming convention style
}
