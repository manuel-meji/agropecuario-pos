#define MyAppName "Agropecuario POS"
#define MyAppVersion "1.0"
#define MyAppPublisher "M&M Software"
#define MyAppExeName "start_pos.vbs"

[Setup]
AppId={{5D8534FE-44BB-440D-BBF7-CB3B24F0D6AF}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DisableProgramGroupPage=yes
OutputBaseFilename=AgropecuarioPOS_Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Files]
Source: "installer_build\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\start_pos.vbs"
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\start_pos.vbs"
Name: "{autoprograms}\Detener {#MyAppName}"; Filename: "{app}\stop_pos.vbs"

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: shellexec postinstall skipifsilent
