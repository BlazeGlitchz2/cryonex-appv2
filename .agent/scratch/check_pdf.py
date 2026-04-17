import pypdf
import os

pdf_path = "/Users/hamzaahmad/Downloads/Complete_Physics_lower_sec_2nd_SB_(S.A.filesð___)_ (1).pdf"

def check_offset():
    try:
        reader = pypdf.PdfReader(pdf_path)
        # Check page index 219 (0-indexed, so PDF page 220)
        page_220 = reader.pages[219]
        text = page_220.extract_text()
        print(f"--- Page 220 Text Start ---")
        print(text[:500])
        print(f"--- Page 220 Text End ---")
        
        # Check page index 3 (PDF page 4) to see if it matches "Introduction"
        page_4 = reader.pages[3]
        text_4 = page_4.extract_text()
        print(f"--- Page 4 Text Start ---")
        print(text_4[:500])
        print(f"--- Page 4 Text End ---")

    except Exception as e:
        print(f"Error: {e}")

check_offset()
