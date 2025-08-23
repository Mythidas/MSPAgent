// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    Manager
};
use tauri::{AppHandle, WebviewWindowBuilder, WebviewUrl};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
                if let Some(main_window) = app.get_webview_window("main") {
                    let _ = main_window.hide();
                }

            // Create menu items
            let request_support_i = MenuItem::with_id(app, "request_support", "Request Support", true, None::<&str>)?;
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
                .on_tray_icon_event(|_tray, event| {
                    // Optional: Handle tray icon clicks (left/right click)
                    match event {
                        TrayIconEvent::Click { button, .. } => {
                            println!("Tray clicked with {:?} button", button);
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn create_support_window(app: &AppHandle) {
    WebviewWindowBuilder::new(app, "support", WebviewUrl::App("support.html".into()))
        .title("Support Request")
        .inner_size(800.0, 600.0)
        .build()
        .expect("Failed to create support window");
}