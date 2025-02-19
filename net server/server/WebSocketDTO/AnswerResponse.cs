namespace Server.WebSocketDTO
{
    #pragma warning disable IDE1006 // Naming convention style
    public class AnswerResponse(string answer)
    {

        public string answer { get; } = answer;

    }
    #pragma warning restore IDE1006 // Naming convention style
}
