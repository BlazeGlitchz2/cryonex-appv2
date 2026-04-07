import pypdf
import os

def extract_pages(input_pdf, output_pdf, ranges):
    writer = pypdf.PdfWriter()
    reader = pypdf.PdfReader(input_pdf)
    
    total_found = 0
    for start, end in ranges:
        # pypdf indexing is 0-based. 
        # range(start-1, end) includes start and end.
        for page_num in range(start - 1, end):
            if page_num < len(reader.pages):
                writer.add_page(reader.pages[page_num])
                total_found += 1
            else:
                print(f"Warning: Page {page_num+1} out of range.")
                
    with open(output_pdf, "wb") as f:
        writer.write(f)
    
    print(f"Status: Success. Extracted {total_found} pages to {output_pdf}.")

if __name__ == "__main__":
    input_file = "social_studies.pdf"
    output_file = "Social_Studies_Study_Pages.pdf"
    
    # Ranges from the study list (printed page numbers, inclusive)
    target_ranges = [
        (206, 210),
        (211, 215),
        (216, 220),
        (222, 223)
    ]
    
    if os.path.exists(input_file):
        extract_pages(input_file, output_file, target_ranges)
    else:
        print(f"Error: {input_file} not found.")
