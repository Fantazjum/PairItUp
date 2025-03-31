using FastEndpoints;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Server.Room;
using Server.DTO;

namespace Server.FastEndpoints {
  [HttpGet("/api/room/{RoomId}")]
  [AllowAnonymous()]
  public class RoomInfoEndpoint(RoomManager roomManager)
    : EndpointWithoutRequest<Results<Ok<RoomDTO>, NotFound>>
    {
        private RoomManager RoomManager { get; set; } = roomManager;

        public override async Task HandleAsync(CancellationToken ct)
        {
            var roomInfo = RoomManager.GetRoom(Route<string>("RoomId")!)?.ToDTO();

            if (roomInfo != null) {
                await SendResultAsync(TypedResults.Ok(roomInfo!));
            } else { 
                await SendResultAsync(TypedResults.NotFound());
            }
        }
    }
}
