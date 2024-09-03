using FastEndpoints;
using Server.WebSocket;

var builder = WebApplication.CreateBuilder();
builder.Services.AddCors();
builder.Services.AddSignalR();
builder.Services.AddFastEndpoints();

var webSocketOptions = new WebSocketOptions {
    KeepAliveInterval = TimeSpan.FromSeconds(10)
};

var app = builder.Build();
app.UseFastEndpoints();
app.UseHttpsRedirection();
app.UseCors(builder=>builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
app.UseWebSockets(webSocketOptions);
app.MapHub<WebSocketHub>("/api/gameConnection");

app.Run();
