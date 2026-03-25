Set fso = CreateObject("Scripting.FileSystemObject")
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = currentDir

' Iniciar MariaDB de forma oculta
WshShell.Run chr(34) & currentDir & "\mariadb\bin\mariadbd.exe" & chr(34) & " --port=3307", 0

' Esperar 3 segundos para que la base de datos inicie correctamente
WScript.Sleep 3000

' Iniciar Backend de Spring Boot usando el JRE empaquetado
' Redefinimos variables importantes por si el application.properties original las tiene hardcodeadas
WshShell.Run chr(34) & currentDir & "\jre\java.exe" & chr(34) & " -Dserver.port=8080 -Dspring.datasource.url=jdbc:mysql://localhost:3307/agropecuario_pos?createDatabaseIfNotExist=true -jar " & chr(34) & currentDir & "\backend.jar" & chr(34), 0

' Esperar 8 segundos para que el servidor backend levante por completo
WScript.Sleep 8000

' Abrir el navegador por defecto
WshShell.Run "http://localhost:8080"
