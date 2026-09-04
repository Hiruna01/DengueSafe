# Render has no native .NET runtime, so the API ships as a container.
# Two stages: the SDK image compiles, the smaller ASP.NET runtime image serves.

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# The csproj alone first, so `dotnet restore` is cached and only re-runs when a
# package reference actually changes — not on every source edit.
COPY HackathonApi.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app ./

# Render assigns the port at runtime and expects the process to bind it on all
# interfaces. Shell form, so ${PORT} is expanded by the shell rather than taken
# literally; the default keeps `docker run` working locally with no PORT set.
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} dotnet HackathonApi.dll"]
