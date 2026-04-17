import pypdf
import os

pdf_path = "/Users/hamzaahmad/Downloads/Complete_Physics_lower_sec_2nd_SB_(S.A.filesð___)_ (1).pdf"

def check_pdf():
    try:
        reader = pypdf.PdfReader(pdf_path)
        print(f"Number of pages: {len(reader.pages)}")
        
        # Print first few pages labels if possible
        for i in range(min(10, len(reader.pages))):
            page = reader.pages[i]
            text = page.extract_text()
            print(f"Index {i} (PDF Pg {i+1}): {text[:100].replace('\n', ' ')}")

    except Exception as e:
        print(f"Error: {e}")

check_pdf()
