using Server.GameObjects;

namespace Server.DTO {
    public class PlayerDTO(string id, string username = "", int score = 0, Card? currentCard = null) {
        public string id { get; } = id;
        public string username { get; } = username;
        public int score { get; } = score;
        public Card? currentCard { get; } = currentCard;
    }
}
