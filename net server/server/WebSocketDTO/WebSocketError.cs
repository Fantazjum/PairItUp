using System.Text.Json.Serialization;

namespace Server.WebSocketDTO
{
    #pragma warning disable IDE1006 // Naming convention style
    public abstract class WebSocketError
    {

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public virtual ErrorType error { get; }
    }

    public class GameNotStartedError : WebSocketError
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public override ErrorType error { get; } = ErrorType.GameNotStarted;
    }

    public class InvalidDataError : WebSocketError
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public override ErrorType error { get; } = ErrorType.InvalidData;
    }

    public class NotFoundError : WebSocketError
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public override ErrorType error { get; } = ErrorType.NotFound;
    }

    public class InvalidUserDataError : WebSocketError
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public override ErrorType error { get; } = ErrorType.InvalidUserData;
    }

    public class NotAHostError : WebSocketError
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public override ErrorType error { get; } = ErrorType.NotAHost;
    }

    public class RoomIdInUseError : WebSocketError
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public override ErrorType error { get; } = ErrorType.RoomIdInUse;
    }
    #pragma warning restore IDE1006 // Naming convention style
}
