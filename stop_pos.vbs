Set fso = CreateObject("Scripting.FileSystemObject")
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = currentDir

' Detener MariaDB de forma segura
WshShell.Run chr(34) & currentDir & "\mariadb\bin\mysqladmin.exe" & chr(34) & " -uroot -P3307 shutdown", 0

' Detener procesos Java (nota: esto cierra todos los procesos java.exe)
WshShell.Run "taskkill /F /IM java.exe /T", 0
