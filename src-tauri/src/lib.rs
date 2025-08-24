// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
    AppHandle, WebviewUrl, WebviewWindowBuilder
};
use tauri_plugin_log::{Target, TargetKind, RotationStrategy, TimezoneStrategy};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::Webview),
                    Target::new(TargetKind::Folder {
                        path: std::path::PathBuf::from("logs"),
                        file_name: None
                    })
                ])
                .max_file_size(50_000)
                .rotation_strategy(RotationStrategy::KeepAll)
                .level(log::LevelFilter::Info)
                .timezone_strategy(TimezoneStrategy::UseLocal)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            read_registry_value,
            write_registry_value,
            get_device_name
        ])
        .setup(|app| {
            // Create menu items
            let request_support_i = MenuItem::with_id(
                app,
                "request_support",
                "Request Support",
                true,
                None::<&str>,
            )?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

            // Create menu with items
            let menu = Menu::with_items(app, &[&request_support_i, &quit_i])?;

            // Build tray icon with menu
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "request_support" => {
                            // Create and show the support window
                            if app.get_webview_window("support").is_none() {
                                create_support_window(app);
                            } else {
                                // If window already exists, just show it
                                if let Some(window) = app.get_webview_window("support") {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                // Prevent the app from quitting when this window is closed
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn create_support_window(app: &AppHandle) {
    WebviewWindowBuilder::new(app, "support", WebviewUrl::App("support.html".into()))
        .title("Support Request")
        .inner_size(800.0, 600.0)
        .build()
        .expect("Failed to create support window");
}

#[tauri::command]
fn read_registry_value(path: &str, value: &str) -> Result<String, String> {
    use winreg::enums::*;
    use winreg::RegKey;

    let hkcu = RegKey::predef(HKEY_LOCAL_MACHINE);
    let subkey = hkcu.open_subkey(path).map_err(|e| e.to_string())?;
    let result: String = subkey.get_value(value).map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
fn write_registry_value(path: &str, value: &str, data: &str) -> Result<(), String> {
    use winreg::enums::*;
    use winreg::RegKey;

    // Open HKLM (or HKCU if you prefer per-user storage)
    let hkcu = RegKey::predef(HKEY_LOCAL_MACHINE);

    // Open or create the subkey with write access
    let (subkey, _) = hkcu.create_subkey(path).map_err(|e| e.to_string())?;

    // Set the value
    subkey.set_value(value, &data).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn get_device_name() -> Result<String, String> {
    match hostname::get() {
        Ok(name) => Ok(name.to_string_lossy().into_owned()),
        Err(e) => Err(e.to_string()),
    }
}
