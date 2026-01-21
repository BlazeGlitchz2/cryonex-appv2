use sysinfo::{System, SystemExt, CpuExt, DiskExt};
use serde::Serialize;

#[derive(Serialize)]
struct DiskInfo {
    name: String,
    total_space: u64,
    available_space: u64,
    mount_point: String,
}

#[derive(Serialize)]
struct SystemInfo {
    cpu_usage: f32,
    total_memory: u64,
    used_memory: u64,
    total_swap: u64,
    used_swap: u64,
    os_name: String,
    os_version: String,
    host_name: String,
    disks: Vec<DiskInfo>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_system_info() -> SystemInfo {
    let mut sys = System::new_all();
    sys.refresh_all();

    let disks = sys.disks().iter().map(|disk| DiskInfo {
        name: disk.name().to_string_lossy().to_string(),
        total_space: disk.total_space(),
        available_space: disk.available_space(),
        mount_point: disk.mount_point().to_string_lossy().to_string(),
    }).collect();

    SystemInfo {
        cpu_usage: sys.global_cpu_info().cpu_usage(),
        total_memory: sys.total_memory(),
        used_memory: sys.used_memory(),
        total_swap: sys.total_swap(),
        used_swap: sys.used_swap(),
        os_name: sys.name().unwrap_or_else(|| "Unknown".to_string()),
        os_version: sys.os_version().unwrap_or_else(|| "Unknown".to_string()),
        host_name: sys.host_name().unwrap_or_else(|| "Unknown".to_string()),
        disks,
    }
}

#[tauri::command]
async fn install_program(name: &str) -> Result<String, String> {
    // Simulate installation
    println!("Installing {}...", name);
    // In a real app, this would run a command or download a file
    // std::thread::sleep(std::time::Duration::from_secs(2));
    Ok(format!("Successfully installed {}", name))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_system_info, install_program])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
