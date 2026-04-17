import pypdf
import os
import glob

# Try to find the file using a pattern if the name is tricky
pattern = "/Users/hamzaahmad/Downloads/Complete_Physics_lower_sec_2nd_SB_*.pdf"
files = glob.glob(pattern)

if not files:
    print("No files found matching pattern.")
    # Fallback to listing everything in Downloads to see what's there
    print("Files in Downloads starting with 'Complete':")
    for f in glob.glob("/Users/hamzaahmad/Downloads/Complete*"):
        print(f"  {f}")
    exit(1)

pdf_path = files[0]
print(f"Found file: {pdf_path}")

def check_pdf():
    try:
        reader = pypdf.PdfReader(pdf_path)
        print(f"Number of pages: {len(reader.pages)}")
        
        # Print first few pages labels if possible
        for i in range(min(15, len(reader.pages))):
            page = reader.pages[i]
            text = page.extract_text() or ""
            snippet = text[:100].replace('\n', ' ')
            print(f"Index {i} (PDF Pg {i+1}): {snippet}")

    except Exception as e:
        print(f"Error: {e}")

check_pdf()
