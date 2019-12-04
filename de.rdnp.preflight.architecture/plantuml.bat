java -jar C:\plantuml\plantuml.jar -graphvizdot "C:\graphviz\bin\dot.exe" "%cd%\target\plantuml\*.puml"
xcopy /y "%cd%\target\plantuml\*.png" "%cd%\doc"