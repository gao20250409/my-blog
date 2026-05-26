$content = Get-Content 'd:\gx\root\my-blog\src\pages\index.astro'
for ($i = 1715; $i -lt 1747 -and $i -lt $content.Count; $i++) {
    "{0}: {1}" -f ($i + 1), $content[$i]
}
