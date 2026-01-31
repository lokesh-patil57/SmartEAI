from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from docx import Document
import io

app = Flask(__name__)
CORS(app)

@app.route("/health")
def health():
    return {"status": "SmartEAI backend running"}

@app.route("/download/pdf", methods=["POST"])
def download_pdf():
    data = request.json
    content = data.get("content", "")

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    text = c.beginText(40, 800)

    for line in content.split("\n"):
        text.textLine(line)

    c.drawText(text)
    c.showPage()
    c.save()

    buffer.seek(0)
    return send_file(
        buffer,
        as_attachment=True,
        download_name="SmartEAI_Content.pdf",
        mimetype="application/pdf"
    )

@app.route("/download/docx", methods=["POST"])
def download_docx():
    data = request.json
    content = data.get("content", "")

    doc = Document()
    for line in content.split("\n"):
        doc.add_paragraph(line)

    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name="SmartEAI_Content.docx",
        mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

if __name__ == "__main__":
    app.run(debug=True)
