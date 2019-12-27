REM Tests this project once and builds this project's dist folder
cmd /C ng t --watch=false --codeCoverage=true
cmd /C ng b --prod