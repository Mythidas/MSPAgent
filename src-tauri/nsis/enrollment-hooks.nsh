# enrollment-hooks.nsh - NSIS hook for MSPByte API Key

!include LogicLib.nsh
!include nsDialogs.nsh
!include FileFunc.nsh

# Define registry keys
!define API_KEY_VALUE "ApiKey"
!define API_ENDPOINT_VALUE "ApiEndpoint"

# Variables
Var ApiKey
Var ApiEndpoint
Var EnrollmentSecret

# Preinstall macro called by Tauri
!macro NSIS_HOOK_PREINSTALL
  Call ProcessEnrollment
!macroend

Function ProcessEnrollment
  # Get command line parameters
  ${GetParameters} $R0
  ${GetOptions} $R0 "/SECRET=" $EnrollmentSecret

  # If no enrollment secret provided, show error and exit
  ${If} $EnrollmentSecret == ""
    MessageBox MB_ICONSTOP|MB_OK "Error: Enrollment secret is required.$\n$\nUsage: installer.exe /SECRET=your-secret /S"
    Quit
  ${EndIf}

  ; Check if API key exists
  ReadRegStr $ApiKey SHCTX "SOFTWARE\MSPByte\MSPAgent" "ApiKey"
  ${If} $ApiKey != ""
    DetailPrint "API key already exists: $ApiKey — skipping enrollment"
    Return
  ${EndIf}

  # Set API endpoint base
  StrCpy $ApiEndpoint "https://mspbyte.pro"

  # Get computer name
  ReadEnvStr $R1 COMPUTERNAME

  ; Construct URL
  StrCpy $R2 "$ApiEndpoint/api/agent/bootstrap?secret=$EnrollmentSecret&deviceName=$R1"

  DetailPrint "Enrollment URL: $R2"

  ; Download directly into stack (no file)
  inetc::get /LOG="$TEMP\inetc.log" "$R2" "$TEMP\dummy.txt"
  Pop $0 ; status string

  ${If} $0 != "OK"
    MessageBox MB_ICONSTOP|MB_OK "Error: Failed to download API Key. inetc returned: $0"
    Quit
  ${EndIf}

  FileOpen $1 "$TEMP\dummy.txt" r
  FileRead $1 $ApiKey
  FileClose $1

  ${If} $ApiKey == ""
    MessageBox MB_ICONSTOP|MB_OK "Error: API Key response is empty — installer failed: $ApiKey"
    Quit
  ${EndIf}

  # Write API Key and endpoint to registry (HKLM)
  WriteRegStr SHCTX "SOFTWARE\MSPByte\MSPAgent" "${API_KEY_VALUE}" "$ApiKey"
  WriteRegStr SHCTX "SOFTWARE\MSPByte\MSPAgent" "${API_ENDPOINT_VALUE}" "$ApiEndpoint"

  # Optional: write startup key
  WriteRegStr SHCTX "SOFTWARE\Microsoft\Windows\CurrentVersion\Run" "MSPAgent" "$INSTDIR\MSPAgent.exe"

  DetailPrint "API Key fetched and stored successfully"
FunctionEnd

# Pre-uninstall cleanup
!macro NSIS_HOOK_PREUNINSTALL
  DeleteRegKey SHCTX "SOFTWARE\MSPByte\MSPAgent"
  DeleteRegValue SHCTX "SOFTWARE\Microsoft\Windows\CurrentVersion\Run" "MSPAgent"
!macroend
