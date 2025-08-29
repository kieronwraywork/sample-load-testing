using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var serviceName = builder.Environment.ApplicationName;

builder.Services.AddOpenTelemetry()
      .ConfigureResource(resource => resource.AddService(serviceName))

      .WithTracing(tracing => tracing
          .AddAspNetCoreInstrumentation()

          //.AddConsoleExporter()
          )
      .WithMetrics(metrics => metrics
          .AddAspNetCoreInstrumentation()
          .AddPrometheusExporter()
          .AddHttpClientInstrumentation()
            .AddEventCountersInstrumentation(c =>
            {
                c.AddEventSources(
                        "Microsoft.AspNetCore.Hosting",
                        "Microsoft-AspNetCore-Server-Kestrel",
                        "System.Net.Http",
                        "System.Net.Sockets");
            })
            .AddMeter("Microsoft.AspNetCore.Hosting", "Microsoft.AspNetCore.Server.Kestrel")
          //.AddConsoleExporter()
          );

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}


// Configure the Prometheus scraping endpoint
app.MapPrometheusScrapingEndpoint();

app.MapPost("initiate", ([FromBody] InitPayload payload) =>
{
    return Results.StatusCode(payload.ResponseCode);
});
app.MapPost("refund", ([FromBody] RefundPayload payload) =>
{ 
    return Results.StatusCode(payload.ResponseCode);
});
app.MapPost("capture", ([FromBody] CapturePayload payload) =>
{
    return Results.StatusCode(payload.ResponseCode);
});
app.MapPost("error", ([FromBody] BasicPayload payload) =>
{ 
    return Results.StatusCode(payload.ResponseCode);
});
app.Run();


record BasicPayload
{
    public string CardType;
    public float? Amount;
    public int ResponseCode;
};
record RefundPayload : BasicPayload {

    public string TransactionId;
}
record InitPayload : BasicPayload{}
record CapturePayload : RefundPayload{}

record InitPayload {
    string CardType;
    float Amount;
    int ResponseCode;
};