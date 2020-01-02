REM Deploys to the server and starts the app
REM -----
REM After this script has run, the new version should be up at http://pre-flight.de
REM NOTE: This script takes the username and password as first and second arguments

IF "%~1" == "" GOTO USAGE
IF "%~2" == "" GOTO USAGE

CD ..\\de.rdnp.preflight.flightplanner\\target
FOR /f %%i in ('dir /b *.jar') do set jarfile=%%i
"C:\Program Files (x86)\WinSCP\winscp.com" /log=upload.log /command ^
    "open sftp://%~1:%~2@1b946d1.online-server.cloud:22/ -explicit -passive=on -rawsettings SendBuf=0 SshSimple=1" ^
    "option confirm off" ^
    "put ""%jarfile%"" ""%jarfile%""" ^
    "exit"
CD %~dp0

plink -ssh -l %~1 -pw %~2 1b946d1.online-server.cloud "pkill -f 'java -jar'"
plink -ssh -l %~1 -pw %~2 1b946d1.online-server.cloud "bash -c ""java -jar -Xmx256M -Dspring.config.location=./application.properties %jarfile% >log.txt >err.txt &"""

GOTO DONE

:USAGE
ECHO No arguments have been provided. Please provide the arguments for this script.
ECHO This script takes the username and password as first and second arguments

:DONE
EXIT /b 0
