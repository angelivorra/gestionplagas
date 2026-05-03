#!/usr/bin/env python3
"""gen_parte.py — Genera plantilla_parte_trabajo.odt para SACEBA."""
import zipfile, io, os

MIME = 'application/vnd.oasis.opendocument.text'

MANIFEST = '''<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
</manifest:manifest>'''

STYLES = '''<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  office:version="1.2">
<office:styles>
  <style:style style:name="Standard" style:family="paragraph">
    <style:text-properties fo:font-size="9pt"/>
  </style:style>
</office:styles>
<office:automatic-styles>
  <style:page-layout style:name="pm1">
    <style:page-layout-properties fo:page-width="21.001cm" fo:page-height="29.7cm"
      style:print-orientation="portrait"
      fo:margin-top="1.1cm" fo:margin-bottom="1.1cm"
      fo:margin-left="1.4cm" fo:margin-right="1.4cm"/>
  </style:page-layout>
</office:automatic-styles>
<office:master-styles>
  <style:master-page style:name="Standard" style:page-layout-name="pm1"/>
</office:master-styles>
</office:document-styles>'''

BD  = "0.04cm solid #000000"
BD2 = "0.06cm solid #000000"

def col_s(n, w):
    return f'<style:style style:name="{n}" style:family="table-column"><style:table-column-properties style:column-width="{w}"/></style:style>'

def row_s(n, h):
    return f'<style:style style:name="{n}" style:family="table-row"><style:table-row-properties style:row-height="{h}" style:use-optimal-row-height="false"/></style:style>'

def cell_s(n, bg="#ffffff", bdr=BD, pad="0.06cm", valign="middle"):
    return (f'<style:style style:name="{n}" style:family="table-cell">'
            f'<style:table-cell-properties fo:border="{bdr}" fo:background-color="{bg}"'
            f' style:vertical-align="{valign}" fo:padding="{pad}"/></style:style>')

def para_s(n, size="9pt", bold=False, align="left"):
    b = "bold" if bold else "normal"
    return (f'<style:style style:name="{n}" style:family="paragraph">'
            f'<style:text-properties fo:font-size="{size}" fo:font-weight="{b}"/>'
            f'<style:paragraph-properties fo:text-align="{align}"/></style:style>')

def text_s(n, bold=False):
    b = "bold" if bold else "normal"
    return f'<style:style style:name="{n}" style:family="text"><style:text-properties fo:font-weight="{b}"/></style:style>'

def tbl_s(n, w="18.2cm"):
    return (f'<style:style style:name="{n}" style:family="table">'
            f'<style:table-properties style:width="{w}" table:align="margins"/></style:style>')

# XML helpers
def p(style, *parts):
    return f'<text:p text:style-name="{style}">{"".join(parts)}</text:p>'

def sp(style, text):
    return f'<text:span text:style-name="{style}">{text}</text:span>'

def tcell(cs, ps, content=""):
    return f'<table:table-cell table:style-name="{cs}">{p(ps, content)}</table:table-cell>'

def trow(rs, *cells):
    return f'<table:table-row table:style-name="{rs}">{"".join(cells)}</table:table-row>'

def tcol(cs):
    return f'<table:table-column table:style-name="{cs}"/>'

def table(name, ts, cols, rows):
    return f'<table:table table:name="{name}" table:style-name="{ts}">{cols}{rows}</table:table>'


NSMAP = ('xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" '
         'xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" '
         'xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" '
         'xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" '
         'xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" '
         'office:version="1.2"')


def auto_styles():
    s = []
    s += [
        para_s("Pn"),
        para_s("Pb", bold=True),
        para_s("Ptl", "11pt", bold=True, align="center"),
        para_s("Ps", "8pt"),
        para_s("TH", "7.5pt", bold=True, align="center"),
        para_s("TC", "8pt"),
    ]
    s += [text_s("Sb", bold=True)]
    s += [tbl_s("T1")]
    # Desinsectacion / Desinfeccion: 3.8+2.0+2.8+5.2+4.4 = 18.2
    s += [col_s(f"di{i}", w) for i, w in enumerate(["3.8cm","2.0cm","2.8cm","5.2cm","4.4cm"], 1)]
    # Desratizacion: 3.8+2.5+2.5+5.0+4.4 = 18.2
    s += [col_s(f"dr{i}", w) for i, w in enumerate(["3.8cm","2.5cm","2.5cm","5.0cm","4.4cm"], 1)]
    # 2-col: 9.1+9.1 = 18.2
    s += [col_s("c2a","9.1cm"), col_s("c2b","9.1cm")]
    # full-width
    s += [col_s("cfw","18.2cm")]
    s += [
        row_s("rh",  "0.58cm"),
        row_s("rd",  "0.50cm"),
        row_s("rn",  "0.52cm"),
        row_s("rob", "2.4cm"),
        row_s("rsig","1.6cm"),
    ]
    s += [
        cell_s("ch",  bg="#cccccc"),
        cell_s("chb", bg="#bbbbbb"),
        cell_s("cd",  bg="#ffffff"),
        cell_s("cnb", bg="#ffffff", bdr="none", pad="0.04cm"),
    ]
    return f'<office:automatic-styles>{"".join(s)}</office:automatic-styles>'


def t_desinsectacion():
    cols = "".join(tcol(f"di{i}") for i in range(1,6))
    hdrs = ["Producto empleado","Cantidad","Forma de aplicación","Lugar","Nº Reg. San."]
    rows = trow("rh", *[tcell("ch","TH",h) for h in hdrs])
    for _ in range(8):
        rows += trow("rd", *[tcell("cd","TC") for _ in range(5)])
    return table("Desinsectacion","T1",cols,rows)

def t_desratizacion():
    cols = "".join(tcol(f"dr{i}") for i in range(1,6))
    hdrs = ["Producto empleado","Cebos Colocados","Cebos Consumidos","Lugar","Nº Reg. San."]
    rows = trow("rh", *[tcell("ch","TH",h) for h in hdrs])
    for _ in range(4):
        rows += trow("rd", *[tcell("cd","TC") for _ in range(5)])
    return table("Desratizacion","T1",cols,rows)

def t_desinfeccion():
    cols = "".join(tcol(f"di{i}") for i in range(1,6))
    hdrs = ["Producto empleado","Cantidad","Forma de aplicación","Lugar","Nº Reg. San."]
    rows = trow("rh", *[tcell("ch","TH",h) for h in hdrs])
    for _ in range(2):
        rows += trow("rd", *[tcell("cd","TC") for _ in range(5)])
    return table("Desinfeccion","T1",cols,rows)


def body():
    spa = p("Pn")

    hdr = table("Hdr","T1", tcol("c2a")+tcol("c2b"),
        trow("rn",
            tcell("cnb","Ptl","SACEBA CONTROL DE PLAGAS"),
            tcell("cnb","Ps","Nº REGISTRO SANITARIO: _______________")
        ) +
        trow("rn",
            tcell("cnb","Ps","NIF: B-00000000  ·  Tel: 000 000 000"),
            tcell("cnb","Pn", sp("Sb","FECHA: ")+"_______ / _______ / 20_____")
        )
    )

    cli = table("Cli","T1", tcol("cfw"),
        trow("rn", tcell("cnb","Pn", sp("Sb","CLIENTE: ")+"__________________________________________________________")) +
        trow("rn", tcell("cnb","Pn", sp("Sb","DOMICILIO: ")+"_________________________________________________________"))
    )

    chk = p("Pn",
        "☐ Tratamiento inicial      "
        "☐ Actuación por requerimiento      "
        "☐ Revisión      "
        "☐ Otros: _________________________"
    )

    trat = p("Pn", sp("Sb","TRATAMIENTOS A REALIZAR: ")+"_____________________________________________________________________")

    horas = table("Horas","T1", tcol("c2a")+tcol("c2b"),
        trow("rn",
            tcell("cnb","Pn", sp("Sb","Hora de inicio del servicio: ")+"__________"),
            tcell("cnb","Pn", sp("Sb","Hora de finalización del servicio: ")+"________")
        )
    )

    plazo = p("Pn",
        sp("Sb","Plazo de seguridad: ") +
        "☐ No      ☐ Sí      Plazo: _____________________      " +
        sp("Sb","Hora de reentrada: ") + "_____________"
    )

    obs = table("Obs","T1", tcol("cfw"),
        trow("rn", tcell("cnb","Pb","OBSERVACIONES:")) +
        trow("rob", tcell("cd","TC"))
    )

    sig = table("Sig","T1", tcol("c2a")+tcol("c2b"),
        trow("rsig",
            tcell("cd","Pn","Servicio realizado por:"),
            tcell("cd","Pn","Conforme, El Cliente:")
        )
    )

    return "".join([
        hdr, spa,
        cli, spa,
        chk, spa,
        trat, spa,
        p("Pb","DESINSECTACIÓN"), t_desinsectacion(), spa,
        p("Pb","DESRATIZACIÓN"),  t_desratizacion(),  spa,
        p("Pb","DESINFECCIÓN"),   t_desinfeccion(),   spa,
        horas, spa,
        plazo, spa,
        obs, spa,
        sig,
    ])


def content_xml():
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        f'<office:document-content {NSMAP}>'
        f'{auto_styles()}'
        '<office:body><office:text>'
        f'{body()}'
        '</office:text></office:body>'
        '</office:document-content>'
    )


def create_odt(path):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        mi = zipfile.ZipInfo("mimetype")
        mi.compress_type = zipfile.ZIP_STORED
        zf.writestr(mi, MIME)
        zf.writestr("META-INF/manifest.xml", MANIFEST)
        zf.writestr("styles.xml", STYLES)
        zf.writestr("content.xml", content_xml())
    with open(path, "wb") as f:
        f.write(buf.getvalue())
    print(f"Generado: {path}")


if __name__ == "__main__":
    base = os.path.dirname(os.path.abspath(__file__))
    out  = os.path.normpath(os.path.join(base, "..", "plantilla_parte_trabajo.odt"))
    create_odt(out)
