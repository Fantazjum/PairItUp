using FastEndpoints;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Server.DTO;

namespace Server.FastEndpoints
{
  [HttpGet("/api/room/{RoomId}")]
  [AllowAnonymous()]
  public class RoomInfoEndpoint(Server server)
    : EndpointWithoutRequest<Results<Ok<RoomDTO>, NotFound>>
    {
        private Server Server { get; set; } = server;

        public override async Task HandleAsync(CancellationToken ct)
        {
            var roomInfo = Server.GetRoom(Route<string>("RoomId")!)?.ToDTO();

            if (roomInfo != null) {
                await SendResultAsync(TypedResults.Ok(roomInfo!));
            } else { 
                await SendResultAsync(TypedResults.NotFound());
            }
        }
    }
}
