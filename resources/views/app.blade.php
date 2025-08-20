<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Building Continuity</title>
        <meta name="description" content="El mejor sistema web para gestionar tu inmueble inteligente" />
        <link rel="icon" type="image/x-icon" href="/images/Icono_Compacto.png">
        @viteReactRefresh
        @vite('resources/js/app.jsx')
        @inertiaHead
    </head>
    <!--<body class="bg-[#FDFDFC] dark:bg-[#0a0a0a] text-[#1b1b18] flex p-6 lg:p-8 items-center lg:justify-center min-h-screen flex-col">-->
    <body>
        @inertia
    </body>
</html>
