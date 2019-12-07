java -jar ..\plantuml\plantuml.jar -graphvizdot "..\graphviz\bin\dot.exe" "%cd%\target\plantuml\*.puml"
xcopy /y "%cd%\target\plantuml\*.png" "%cd%\doc"