using FastEndpoints;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Server.DTO;

namespace Server.FastEndpoints {
    [AllowAnonymous]
    [HttpGet("/api/room/{RoomId}")]
    public class RoomInfoEndpoint : Endpoint<RoomInfoRequest, Results<Ok<RoomDTO>, NotFound>> {

        public override async Task<Results<Ok<RoomDTO>,NotFound>> HandleAsync(RoomInfoRequest req, CancellationToken ct) {
            var roomInfo = Server.Instance.GetRoom(req.RoomId)?.ToDTO();
            
            // simulate async task for endpoint type
            await Task.CompletedTask;

            if (roomInfo != null) {
                return TypedResults.Ok(roomInfo!);
            }

            return TypedResults.NotFound();
        }
    }
}
