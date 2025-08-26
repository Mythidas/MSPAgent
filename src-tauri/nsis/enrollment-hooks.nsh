# enrollment-hooks.nsh - Custom NSIS hooks for enrollment secret
# This file extends Tauri's default NSIS installer with enrollment functionality

!include LogicLib.nsh
!include nsDialogs.nsh
!include FileFunc.nsh

# Define our registry keys
!define ENROLLMENT_SECRET_VALUE "EnrollmentSecret"
!define API_ENDPOINT_VALUE "ApiEndpoint"

# Variables for enrollment
Var EnrollmentSecret
Var ApiEndpoint

# This macro is called by Tauri's installer BEFORE the main installation
!macro NSIS_HOOK_PREINSTALL
  Call ProcessEnrollmentSecret
!macroend

# Function to process enrollment secret from command line
Function ProcessEnrollmentSecret
  # Get command line parameters
  ${GetParameters} $R0
  ${GetOptions} $R0 "/SECRET=" $EnrollmentSecret
  
  # If no enrollment secret provided, show error and exit
  ${If} $EnrollmentSecret == ""
    MessageBox MB_ICONSTOP|MB_OK "Error: Secret is required.$\n$\nUsage: installer.exe /SECRET=enrollment-secret$\n$\nFor silent install: installer.exe /SECRET=your-secret /S"
    Quit
  ${EndIf}
  
  # Validate enrollment secret format
  StrLen $R1 $EnrollmentSecret
  ${If} $R1 < 16
    MessageBox MB_ICONSTOP|MB_OK "Error: Enrollment secret must be at least 16 characters long."
    Quit
  ${EndIf}
  
  # Set your API endpoint (centralized)
  StrCpy $ApiEndpoint "http://192.168.1.112:3000"
  
  # Show confirmation dialog (but not in silent mode and don't reveal full secret)
  ${IfNot} ${Silent}
    StrCpy $R2 $EnrollmentSecret 8  # Show first 8 chars
    MessageBox MB_ICONQUESTION|MB_YESNO "Installing ${PRODUCTNAME} with enrollment secret: $R2...$\n$\nAPI Endpoint: $ApiEndpoint$\n$\nContinue with installation?" IDYES continue
    Quit
    continue:
  ${EndIf}
  
  # Write enrollment configuration to registry
  WriteRegStr SHCTX "SOFTWARE\MSPByte\MSPAgent" "${ENROLLMENT_SECRET_VALUE}" "$EnrollmentSecret"
  WriteRegStr SHCTX "SOFTWARE\MSPByte\MSPAgent" "${API_ENDPOINT_VALUE}" "$ApiEndpoint"

  # Write startup key for exe
  WriteRegStr SHCTX "SOFTWARE\Microsoft\Windows\CurrentVersion\Run" "MSPAgent" "$INSTDIR\MSPAgent.exe"
  
  # Log success (only visible in detailed installer log)
  DetailPrint "Enrollment configuration saved successfully"
FunctionEnd

# This macro is called during uninstallation
!macro NSIS_HOOK_PREUNINSTALL
  # Clean up our registry entries
  DeleteRegKey SHCTX "SOFTWARE\MSPByte\MSPAgent"
  DeleteRegValue SHCTX "SOFTWARE\Microsoft\Windows\CurrentVersion\Run" "MSPAgent"
!macroend