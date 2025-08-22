# enrollment-hooks.nsh - Custom NSIS hooks for enrollment secret
# This file extends Tauri's default NSIS installer with enrollment functionality

!include LogicLib.nsh
!include nsDialogs.nsh

# Define our registry keys
!define ENROLLMENT_REGISTRY_KEY "SOFTWARE\${PRODUCTNAME}"
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
  ${GetOptions} $R0 "/ENROLLMENT_SECRET=" $EnrollmentSecret
  
  # If no enrollment secret provided, show error and exit
  ${If} $EnrollmentSecret == ""
    MessageBox MB_ICONSTOP|MB_OK "Error: Enrollment secret is required.$\n$\nUsage: installer.exe /ENROLLMENT_SECRET=your-enrollment-secret$\n$\nFor silent install: installer.exe /ENROLLMENT_SECRET=your-secret /S"
    Quit
  ${EndIf}
  
  # Validate enrollment secret format
  StrLen $R1 $EnrollmentSecret
  ${If} $R1 < 16
    MessageBox MB_ICONSTOP|MB_OK "Error: Enrollment secret must be at least 16 characters long."
    Quit
  ${EndIf}
  
  # Set your API endpoint (centralized)
  StrCpy $ApiEndpoint "https://api.yourdomain.com"
  
  # Show confirmation dialog (but not in silent mode and don't reveal full secret)
  ${IfNot} ${Silent}
    StrCpy $R2 $EnrollmentSecret 8  # Show first 8 chars
    MessageBox MB_ICONQUESTION|MB_YESNO "Installing ${PRODUCTNAME} with enrollment secret: $R2...$\n$\nAPI Endpoint: $ApiEndpoint$\n$\nContinue with installation?" IDYES continue
    Quit
    continue:
  ${EndIf}
  
  # Write enrollment configuration to registry
  WriteRegStr SHCTX "${ENROLLMENT_REGISTRY_KEY}" "${ENROLLMENT_SECRET_VALUE}" "$EnrollmentSecret"
  WriteRegStr SHCTX "${ENROLLMENT_REGISTRY_KEY}" "${API_ENDPOINT_VALUE}" "$ApiEndpoint"
  WriteRegStr SHCTX "${ENROLLMENT_REGISTRY_KEY}" "EnrollmentDate" "$R0"
  
  # Log success (only visible in detailed installer log)
  DetailPrint "Enrollment configuration saved successfully"
FunctionEnd

# This macro is called during uninstallation
!macro NSIS_HOOK_PREUNINSTALL
  # Clean up our registry entries
  DeleteRegKey SHCTX "${ENROLLMENT_REGISTRY_KEY}"
!macroend