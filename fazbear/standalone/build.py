# Gera fazbear-site.html: um único arquivo com CSS, JS e imagens embutidos (abre sem servidor).
import base64, io, os, json
from PIL import Image
R = os.path.join(os.path.dirname(__file__), "..")
F = lambda *p: open(os.path.join(R, *p), encoding="utf-8").read()
def uri(img, fmt, **kw):
    b = io.BytesIO(); img.save(b, fmt, **kw)
    return f"data:image/{fmt.lower()};base64," + base64.b64encode(b.getvalue()).decode()
def abrir(n): return Image.open(os.path.join(R, "frontend", "img", n))

fundo = abrir("fundo.jpg"); fundo = fundo.resize((600, round(600 * fundo.height / fundo.width)))
imgs = {n: uri(abrir(n + ".png").convert("RGB"), "JPEG", quality=84, optimize=True) for n in ("freddy", "bonnie", "chica", "foxy")}
logo = uri(abrir("logo.png"), "WEBP", quality=88)

css = F("frontend", "css", "style.css").replace('url("../img/fundo.jpg")', 'url("%s")' % uri(fundo.convert("RGB"), "JPEG", quality=82, optimize=True))
css += "\nbody { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }\n:root { color-scheme: light; }\n"
html = F("frontend", "index.html")
html = html.replace('<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">')
html = html.replace('<link rel="stylesheet" href="css/style.css">', "<style>\n" + css + "</style>")
html = html.replace('src="img/logo.png"', 'src="%s"' % logo)
api_real = F("frontend", "js", "api.js").replace("async function api(", "async function apiServidor(")
js = "\n".join([F("frontend", "js", "config.js"), "window.FAZBEAR_IMG = %s;" % json.dumps(imgs), api_real,
                F("standalone", "local-api.js"), F("standalone", "modo.js"), F("frontend", "js", "games.js"), F("frontend", "js", "app.js")])
ini = html.index('<script src="js/config.js">'); fim = html.index("</body>")
html = html[:ini] + "<script>\n" + js + "\n</script>\n" + html[fim:]
open(os.path.join(R, "standalone", "fazbear-site.html"), "w", encoding="utf-8").write(html)
print(round(len(html) / 1024), "KB")
