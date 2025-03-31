# Pair It Up

This project was generated with [Angular CLI](https://github.com/angular/angular-cli). 
It was made to have a working app using the data and created server backend.
Any regular Angular CLI commands apply.

## Running the app using docker

Run following commands in the command prompt:


>docker build --pull -t server .
>
>docker run --name PairItUp -p \<port>:8080 server


Replace \<port> with desired port

## Modifying the app

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

You will need to use run `dotnet run --launch-profile https` or use .NET editor with project launching ability to have a working server for the app. 
The default ports are `5225` and `7171` for `http` and `https` respectively.
You may ignore https profile if you only intend to launch it over http.

To save the modifications to angular app given whilst hosting the .NET server, run `ng build --configuration production` command.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

To get more help on .NET visit [Microsoft .NET Introduction](https://learn.microsoft.com/en-us/dotnet/core/introduction) page.