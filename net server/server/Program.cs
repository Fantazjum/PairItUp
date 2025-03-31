using FastEndpoints;
using Server.Extensions;

var options = new WebApplicationOptions() {
    Args = args,
    EnvironmentName = "Production",
    WebRootPath = "wwwroot/browser"
};

var builder = WebApplication.CreateBuilder(options);
builder.Services.AddControllers();
builder.Services.AddServerDependencies()
  .AddWebSocketDependencies()
  .AddSpaDependencies();

var webSocketOptions = new WebSocketOptions {
    KeepAliveInterval = TimeSpan.FromSeconds(10),
    KeepAliveTimeout = TimeSpan.FromSeconds(30)
};

#if DEBUG
builder.Services.AddCors(options => {
    options.AddPolicy("TestPolicy", builder => {
        builder.AllowAnyOrigin().AllowAnyMethod().DisallowCredentials();
    });
});
#endif

builder.Services.AddFastEndpoints();

var app = builder.Build();
app.UseFastEndpoints()
  .UseDefaultFiles()
  .UseStaticFiles()
  .UseRouting()
  .UseWebSockets(webSocketOptions);

#if DEBUG
app.UseCors("TestPolicy");
#endif

app.Map("/game", spaApp => {
    spaApp.UseSpa(spa => {
        spa.Options.SourcePath = "wwwroot/browser";
    });
});

app.MapControllers();

app.Run();
