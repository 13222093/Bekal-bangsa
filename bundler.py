import os

# --- KONFIGURASI FILTER ---
# Folder yang PASTI diabaikan (JANGAN DIHAPUS node_modules!)
IGNORE_DIRS = {
    '.git', '__pycache__', 'venv', 'env', 'node_modules', 
    '.next', '.idea', '.vscode', 'dist', 'build', 'public', 'assets'
}

# File spesifik yang bikin penuh tapi gak penting buat logika
IGNORE_FILES = {
    'bundler.py', 'bundler_aman.py', 
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'poetry.lock',
    'README.md', '.gitignore', 'favicon.ico', 'next-env.d.ts'
}

# Hanya ambil file kodingan
ALLOWED_EXTENSIONS = {'.py', '.js', '.jsx', '.ts', '.tsx', '.sql', '.css', '.env.example'}

# Batas aman per file (biar gak ketarik file minified/panjang banget)
MAX_LINES_PER_FILE = 1000 

def get_project_context(output_file="full_context.txt"):
    total_lines = 0
    total_files = 0
    skipped_files = 0
    
    with open(output_file, "w", encoding="utf-8") as outfile:
        outfile.write(f"Project Context Scan\n\n")

        # 1. Tulis Struktur Folder (Biar AI tau lokasi file)
        outfile.write("--- PROJECT STRUCTURE ---\n")
        for root, dirs, files in os.walk("."):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            level = root.replace(".", "").count(os.sep)
            indent = " " * 4 * (level)
            outfile.write(f"{indent}{os.path.basename(root)}/\n")
            subindent = " " * 4 * (level + 1)
            for f in files:
                if f not in IGNORE_FILES:
                     outfile.write(f"{subindent}{f}\n")
        
        outfile.write("\n\n--- FILE CONTENTS ---\n")

        # 2. Tulis Isi File
        for root, dirs, files in os.walk("."):
            # Skip folder sampah
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            
            for file in files:
                if file in IGNORE_FILES:
                    continue
                
                ext = os.path.splitext(file)[1]
                if ext not in ALLOWED_EXTENSIONS:
                    continue

                file_path = os.path.join(root, file)
                
                try:
                    with open(file_path, "r", encoding="utf-8") as infile:
                        lines = infile.readlines()
                        
                        # Safety: Skip file yang kepanjangan (misal library nyasar)
                        if len(lines) > MAX_LINES_PER_FILE:
                            print(f"⚠️  Skipping {file_path} (Terlalu panjang: {len(lines)} baris)")
                            outfile.write(f"\n[SKIPPED LARGE FILE: {file_path} - {len(lines)} lines]\n")
                            skipped_files += 1
                            continue

                        content = "".join(lines)
                        
                        outfile.write(f"\n{'='*50}\n")
                        outfile.write(f"FILENAME: {file_path}\n")
                        outfile.write(f"{'='*50}\n")
                        outfile.write(content + "\n")
                        
                        total_lines += len(lines)
                        total_files += 1
                        
                except Exception as e:
                    print(f"❌ Error reading {file_path}: {e}")

    print(f"\n✅ SELESAI! Hasil disimpan di '{output_file}'")
    print(f"📊 Statistik:")
    print(f"   - Total File  : {total_files}")
    print(f"   - Skipped     : {skipped_files}")
    print(f"   - Total Baris : {total_lines}")
    
    if total_lines > 50000:
        print("\n⚠️  PERINGATAN: File cukup besar (>50k baris).")
        print("    Mungkin kamu lupa exclude folder tertentu?")
    else:
        print("\n👍 Ukuran aman. Siap diupload ke Gemini.")

if __name__ == "__main__":
    get_project_context()