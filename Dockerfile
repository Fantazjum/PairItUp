FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /Server

# install NodeJS 22.x
# see https://github.com/nodesource/distributions/blob/master/README.md#deb
RUN apt-get update -yq 
RUN apt-get install curl gnupg -yq 
RUN curl -sL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get install -y nodejs

# copy project and build angular app 
COPY . ./
RUN npm install -g @angular/cli
RUN npm install
RUN ng build --configuration=production

# build .NET app
WORKDIR "net server/server"
RUN dotnet restore .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app ./
EXPOSE 8080
ENTRYPOINT ["dotnet", "Server.dll"]