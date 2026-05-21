<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="user-authenticated" content="{{ auth()->check() ? 'true' : 'false' }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        @php
            $favicon = \App\Models\SystemSetting::get('favicon');
            $faviconUrl = $favicon ? \Storage::url($favicon) : '/favicon.svg';
        @endphp
        <link rel="icon" href="{{ $faviconUrl }}">
        <!-- <link rel="preconnect" href="https://fonts.bunny.net"> -->
        <!-- <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" /> -->
        <link
        href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
        rel="stylesheet">

        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead

        <!-- script for analytics -->
        <!--  1. Microsoft Clarity -->
        <script type="text/javascript">
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "uui85ll9le");
        </script>

        <!--  2. Crudly Shared Session + Clarity Sync -->
        <script>
        (function () {
        const COOKIE_NAME = "crudly_recording_id";
        const DOMAIN = ".crudly.ai";
        const EXPIRY_DAYS = 365;

        // Generate unique ID
        function generateId() {
            return crypto.randomUUID();
        }

        // Set shared cookie
        function setCookie(name, value, days) {
            const expires = new Date(Date.now() + days * 864e5).toUTCString();
            document.cookie = `${name}=${value}; expires=${expires}; path=/; domain=${DOMAIN}; Secure; SameSite=None`;
        }

        // Get cookie
        function getCookie(name) {
            return document.cookie.split("; ").reduce((r, v) => {
            const parts = v.split("=");
            return parts[0] === name ? parts[1] : r;
            }, "");
        }

        // Init session (FIXED 1 year)
        function initSession() {
            let id = getCookie(COOKIE_NAME);

            if (!id) {
            id = localStorage.getItem(COOKIE_NAME);
            }

            if (!id) {
            id = generateId();
            setCookie(COOKIE_NAME, id, EXPIRY_DAYS);
            localStorage.setItem(COOKIE_NAME, id);
            }

            return id;
        }

        // Apply Clarity safely (retry until loaded)
        function applyClarity(sessionId) {
            if (typeof clarity === "function") {
            clarity("identify", sessionId);       // strong user identity
            clarity("set", "crudly_id", sessionId); // custom filter
            } else {
            setTimeout(() => applyClarity(sessionId), 200);
            }
        }

        // Init everything
        const sessionId = initSession();

        window.CRUDLY_SESSION_ID = sessionId;

        // Sync with Clarity
        applyClarity(sessionId);

        console.log("Crudly Session (fixed 1 year):", sessionId);

        })();
        </script>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
