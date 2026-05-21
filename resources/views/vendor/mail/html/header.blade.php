@props(['url'])
@php
    $appName = \App\Models\SystemSetting::get('name', config('app.name'));
    $logoUrl = config('app.url') . '/logo.png';
@endphp
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
<img src="{{ $logoUrl }}" class="logo" alt="{{ $appName }} Logo" style="height: 22px; width: auto;">
</a>
</td>
</tr>
